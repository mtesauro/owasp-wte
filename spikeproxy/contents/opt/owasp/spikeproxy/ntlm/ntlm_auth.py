# This file is part of 'NTLM Authorization Proxy Server'
# Copyright 2001 Dmitry A. Rozmanov <dima@xenon.spb.ru>
#
# NTLM APS is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# NTLM APS is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with the sofware; see the file COPYING. If not, write to the
# Free Software Foundation, Inc.,
# 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
#

import string, select, base64
import ntlm_messages, utils, ntlm_procs

class ntlm_auther:
    """
    NTLM authenticator class. Makes an HTTP authentication using NTLM method.
    """

    #-----------------------------------------------------------------------
    def __init__(self):
        ""
        pass

    #-----------------------------------------------------------------------
    def proxy_ntlm_authentication(self, connection):
        ""
        connection.logger.log('*** Authorization in progress...\n')

        connection.close_rserver()

        # build an environment
        env = self.build_env_dict(connection)

        if env['NTLM_TO_BASIC']:
            got_credentials = self.translate_to_basic(env, connection, '407')

            if not got_credentials:
                connection.logger.log("*** Passing modified server's response to clent.\n")
                connection.logger.log('*** End of firts stage of NTLM translation.\n')
                return

        connection.connect_rserver()

        NTLM_msg1 = ntlm_messages.create_message1(env)
        connection.logger_auth.log(ntlm_messages.debug_message1(NTLM_msg1))

        tmp_client_head_obj = connection.client_head_obj.copy()
        tmp_client_head_obj.replace_param_value('Proxy-Connection', 'Keep-Alive')
        tmp_client_head_obj.replace_param_value('Proxy-Authorization', 'NTLM ' + NTLM_msg1)

        connection.reset_rserver()
        connection.rserver_buffer = ''
        connection.logger.log('*** Remote server buffer flushed.\n')

        # If we are POST/PUT-ing a large chunk of data we don't want
        # to do this at this time, so we change the data to 'abc' with
        # lenght = 3.
        if connection.client_head_obj.get_http_method() in ('POST', 'PUT'):
            tmp_client_head_obj.replace_param_value('Content-Length', '3')

        connection.logger.log('*** Fake NTLM header with Msg1:\n=====\n' + tmp_client_head_obj.__repr__())
        connection.logger.log('*** Sending Fake NTLM header with Msg1...')
        tmp_client_head_obj.send(connection.rserver_socket)
        connection.logger.log('Done.\n')

        if connection.client_head_obj.get_http_method() in ('POST', 'PUT'):
            try:
                connection.logger.log("*** Sending fake 'abc' bytes body...")
                connection.rserver_socket.send('abc')
                connection.logger.log("Done.\n")
            except:
                # could not send data to remote server and have to end function
                connection.rserver_socket_closed = 1
                connection.logger.log('Failed.\n*** Could not send client data to remote server. Exception in send().\n')
                return
        else:
            connection.logger.log("*** There must be no body to send.\n")


        connection.logger.log('*** Waiting for message 2 from remote server...\n')
        while((not connection.rserver_all_got) and (not connection.rserver_socket_closed)):
            select.select([connection.rserver_socket.fileno()], [], [], 2.0)
            connection.run_rserver_loop()
            if connection.config['DEBUG']['SCR_DEBUG']: print '\b+',

        if connection.rserver_head_obj:
            connection.logger.log('*** Got NTLM message 2 from remote server.\n')
        else:
            # could not get response with msg2 from remote server and have to end function
            connection.logger.log('*** Could not get response with msg2 from remote server.\n')
            connection.logger.log('*** Stop Request = %d.\n' % connection.stop_request)
            return

        auth = connection.rserver_head_obj.get_param_values('Proxy-Authenticate')
        if auth:
            msg2 = string.strip(string.split(auth[0])[1])
            connection.logger_auth.log(ntlm_messages.debug_message2(msg2))
            nonce = ntlm_messages.parse_message2(msg2)
            NTLM_msg3 = ntlm_messages.create_message3(nonce, env)
            connection.logger_auth.log(ntlm_messages.debug_message3(NTLM_msg3))
        else:
            NTML_msg3 = ''

        tmp_client_head_obj = connection.client_head_obj.copy()
        tmp_client_head_obj.replace_param_value('Proxy-Authorization', 'NTLM ' + NTLM_msg3)

        connection.reset_rserver()
        connection.rserver_buffer = ''
        connection.logger.log('*** Remote server buffer flushed.\n')
        connection.logger.log('*** Sending Fake NTLM header (not body) with Msg3...')
        tmp_client_head_obj.send(connection.rserver_socket)
        connection.logger.log('Done.\n')
        connection.logger.log('*** Fake NTLM header with Msg3:\n=====\n' + tmp_client_head_obj.__repr__())

        # upon exit all the remote server variables are reset
        # so new remote server response will be taken by the usual way in connection.run()
        connection.logger.log('*** End of NTLM authorization process.\n')

    #-----------------------------------------------------------------------
    def www_ntlm_authentication(self, connection):
        ""
        connection.logger.log('*** Authorization in progress...\n')

        connection.close_rserver()

        # build an environment
        env = self.build_env_dict(connection)

        if env['NTLM_TO_BASIC']:
            got_credentials = self.translate_to_basic(env, connection, '401')

            if not got_credentials:
                connection.logger.log("*** Passing modified server's response to clent.\n")
                connection.logger.log('*** End of firts stage of NTLM translation.\n')
                return

        connection.connect_rserver()

        NTLM_msg1 = ntlm_messages.create_message1(env)
        connection.logger_auth.log(ntlm_messages.debug_message1(NTLM_msg1))

        tmp_client_head_obj = connection.client_head_obj.copy()
        tmp_client_head_obj.replace_param_value('Connection', 'Keep-Alive')
        #tmp_client_head_obj.replace_param_value('Authorization', 'Negotiate ' + NTLM_msg1)
        tmp_client_head_obj.replace_param_value('Authorization', 'NTLM ' + NTLM_msg1)

        connection.reset_rserver()
        connection.rserver_buffer = ''
        connection.logger.log('*** Remote server buffer flushed.\n')

        # If we are POST/PUT-ing a large chunk of data we don't want
        # to do this at this time, so we change the data to 'abc' with
        # lenght = 3.
        if connection.client_head_obj.get_http_method() in ('POST', 'PUT'):
            tmp_client_head_obj.replace_param_value('Content-Length', '3')

        connection.logger.log('*** Fake NTLM header with Msg1:\n=====\n' + tmp_client_head_obj.__repr__())
        connection.logger.log('*** Sending Fake NTLM header (and body) with Msg1...')
        tmp_client_head_obj.send(connection.rserver_socket)

        if connection.client_head_obj.get_http_method() in ('POST', 'PUT'):
            try:
                connection.rserver_socket.send('abc')
            except:
                # could not send data to remote server and have to end function
                connection.rserver_socket_closed = 1
                connection.logger.log('Failed.\n*** Could not send client data to remote server. Exception in send().\n')
                return

        connection.logger.log('Done.\n')

        connection.logger.log('*** Waiting for message 2 from the remote server...\n')
        while((not connection.rserver_all_got) and (not connection.rserver_socket_closed)):
            select.select([connection.rserver_socket.fileno()], [], [], 2.0)
            connection.run_rserver_loop()
            if connection.config['DEBUG']['SCR_DEBUG']: print '\b+',

        if connection.rserver_head_obj:
            connection.logger.log('*** Got NTLM message 2 from server.\n')
            # connection.logger.log('*** Remote server header with NTLM Msg2:\n=====\n' + connection.rserver_head_obj.__repr__())
        else:
            # could not get response with msg2 from remote server and have to end function
            connection.logger.log('*** Could not get response with msg2 from server.\n')
            connection.logger.log('*** Stop Request = %d.\n' % connection.stop_request)
            return

        auth = connection.rserver_head_obj.get_param_values('Www-Authenticate')
        if auth:
            #connection.logger.log('### %s\n' % auth)
            msg2 = string.strip(string.split(auth[0])[1])
            connection.logger_auth.log(ntlm_messages.debug_message2(msg2))
            nonce = ntlm_messages.parse_message2(msg2)
            NTLM_msg3 = ntlm_messages.create_message3(nonce, env)
            connection.logger_auth.log(ntlm_messages.debug_message3(NTLM_msg3))
        else:
            NTML_msg3 = ''

        tmp_client_head_obj = connection.client_head_obj.copy()
        #tmp_client_head_obj.replace_param_value('Authorization', 'Negotiate ' + NTLM_msg3)
        tmp_client_head_obj.replace_param_value('Authorization', 'NTLM ' + NTLM_msg3)

        connection.reset_rserver()
        connection.rserver_buffer = ''
        connection.logger.log('*** Remote server buffer flushed.\n')
        connection.logger.log('*** Sending Fake NTLM header (not body) with Msg3...')
        tmp_client_head_obj.send(connection.rserver_socket)
        connection.logger.log('Done.\n')
        connection.logger.log('*** Fake NTLM header with Msg3:\n=====\n' + tmp_client_head_obj.__repr__())

        # upon exit all the remote server variables are reset
        # so new remote server response will be taken by the usual way in connection.run()
        connection.logger.log('*** End of NTLM authorization process.\n')

    #-----------------------------------------------------------------------
    def build_env_dict(self, connection):
        ""
        connection.logger.log('*** Building environment for NTLM.\n')

        env = {}

        if connection.config['NTLM_AUTH']['NTLM_FLAGS']:
            env['FLAGS'] = connection.config['NTLM_AUTH']['NTLM_FLAGS']

            connection.logger.log('*** Using custom NTLM flags: %s\n' % env['FLAGS'])

        else:
            # I have seen flag field '\005\202' as well (with NT response).
            #0x8206 or 0x8207 or 0x8205
            env['FLAGS'] = "06820000"
            #flags = utils.hex2str(ed['NTLM_FLAGS'])

            connection.logger.log('*** Using default NTLM flags: %s\n' % env['FLAGS'])


        env['LM'] = connection.config['NTLM_AUTH']['LM_PART']
        env['NT'] = connection.config['NTLM_AUTH']['NT_PART']

        # we must have at least LM part
        if not (env['LM'] or env['NT']):
            env['LM'] = 1

        if env['LM'] == 1 and env['NT'] == 0:
            connection.logger.log('*** NTLM version with LM response only.\n')

        elif env['LM'] == 1 and env['NT'] == 1:
            connection.logger.log('*** NTLM version with LM and NT responses.\n')

        elif env['LM'] == 0 and env['NT'] == 1:
            connection.logger.log('*** NTLM version with NT response only.\n')

        #env['UNICODE'] = connection.config['NTLM_AUTH']['UNICODE']
        if env['NT']:
            env['UNICODE'] = 1
        else:
            env['UNICODE'] = 0

        # have to put these ones into [NTLM] section
        env['DOMAIN'] = string.upper(connection.config['NTLM_AUTH']['NT_DOMAIN'])

        # Check if there is explicit NT_Hostname in config, if there is one then take it,
        # if there is no one then take gethostname() result.
        if connection.config['NTLM_AUTH']['NT_HOSTNAME']:
            env['HOST'] = string.upper(connection.config['NTLM_AUTH']['NT_HOSTNAME'])
        else:
            env['HOST'] = string.upper(connection.config['GENERAL']['HOST'])

        env['USER'] = string.upper(connection.config['NTLM_AUTH']['USER'])

        connection.logger.log('*** NTLM Domain/Host/User: %s/%s/%s\n' % (env['DOMAIN'], env['HOST'], env['USER']))

        # have to use UNICODE stings
        if env['UNICODE']:
            env['DOMAIN'] = utils.str2unicode(env['DOMAIN'])
            env['HOST'] = utils.str2unicode(env['HOST'])
            env['USER'] = utils.str2unicode(env['USER'])

            connection.logger.log('*** Using UNICODE stings.\n')


        if connection.config['NTLM_AUTH']['LM_HASHED_PW'] and connection.config['NTLM_AUTH']['NT_HASHED_PW']:
            env['LM_HASHED_PW'] = connection.config['NTLM_AUTH']['LM_HASHED_PW']
            env['NT_HASHED_PW'] = connection.config['NTLM_AUTH']['NT_HASHED_PW']

            connection.logger.log('*** NTLM hashed passwords found.\n')

        # Test params
        if connection.config['NTLM_AUTH'].has_key('NTLM_MODE'):
            env['NTLM_MODE'] = int(connection.config['NTLM_AUTH']['NTLM_MODE'])
        else:
            env['NTLM_MODE'] = 0

        # End of test params

        env['NTLM_TO_BASIC'] = int(connection.config['NTLM_AUTH']['NTLM_TO_BASIC'])

        connection.logger.log('*** Environment has been built successfully.\n')

        return env

    #-----------------------------------------------------------------------
    def translate_to_basic(self, environment, connection, error_code):
        ""
        connection.logger.log('*** Translating NTLM to Basic...\n')
        user, password = self.get_credentials_from_basic(connection, error_code)
        if user:
            connection.logger.log("*** Found Basic credentials in client's header.\n")
            environment['USER'] = user
            #environment['PASSWORD'] = password
            connection.logger.log("*** Basic User/Password: %s/%s.\n" % (user, password))

            connection.logger.log("*** Calculating hashed passwords (LM and NT)...")
            environment['LM_HASHED_PW'] = ntlm_procs.create_LM_hashed_password(password)
            environment['NT_HASHED_PW'] = ntlm_procs.create_NT_hashed_password(password)
            connection.logger.log("Done.\n")

            return 1

        else:
            connection.logger.log("*** There are no basic credentials in client's header.\n")
            connection.logger.log("*** Replacing NTLM value with Basic in rserver's header...")
            self.replace_ntlm_with_basic(connection, error_code)
            connection.logger.log("Done.\n")

            connection.logger.log("*** New server's header:\n=====\n" + connection.rserver_head_obj.__repr__())

            return 0

    #-----------------------------------------------------------------------
    def replace_ntlm_with_basic(self, connection, error_code):
        ""
        if error_code == '401': value_name = 'Www-Authenticate'
        else: value_name = 'Proxy-Authenticate'

        realm = connection.client_head_obj.get_http_server()
        basic_str = 'Basic realm="%s:%s"' % realm
        connection.rserver_head_obj.replace_param_value(value_name, basic_str)

    #-----------------------------------------------------------------------
    def get_credentials_from_basic(self, connection, error_code):
        ""
        if error_code == '401': value_name = 'Authorization'
        else: value_name = 'Proxy-Authorization'

        l = connection.client_head_obj.get_param_values(value_name)
        user, password = '', ''
        for i in l:
            t = string.split(i)[0]
            if string.lower(t) == 'basic':
                b64 = string.split(i)[1]
                cred = base64.decodestring(b64)
                user = string.split(cred, ':')[0]
                password = string.split(cred, ':')[1]

        return user, password

