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

import string, socket, thread, select, time
import logger, http_header, utils
import ntlm_auth, basic_auth

class proxy_HTTP_Client:
    ""

    #-----------------------------------------------------------------------
    def __init__(self, client_socket, address, config):
        ""
        self.config = config

        self.ntlm_auther = ntlm_auth.ntlm_auther()
        # experimental code
        self.basic_auther = basic_auth.basic_auther()
        # experimental code end

        self.proxy_authorization_tried = 0
        self.www_authorization_tried = 0
        self.tunnel_mode = 0

        # define log files
        self.logger_bin_client = logger.Logger('%s-%d.bin.client' % address, self.config['DEBUG']['BIN_DEBUG'])
        self.logger_bin_rserver = logger.Logger('%s-%d.bin.rserver' % address, self.config['DEBUG']['BIN_DEBUG'])
        self.logger_auth = logger.Logger('%s-%d.auth' % address, self.config['DEBUG']['AUTH_DEBUG'])
        self.logger = logger.Logger('%s-%d' % address, self.config['DEBUG']['DEBUG'])

        # set it to 1 till we will connect actually???
        # No!!! In that case we have unexpected exit if the client sends its header slow.
        self.rserver_socket_closed = 1  # Yes !
        # This is a flag that means that we have not tried connecting to
        # the remote host. And self.rserver_socket_closed = 1 is not requiring
        # to finish thread.
        # Do not like this solution.
        self.first_run = 1
        self.client_socket_closed = 0
        self.stop_request = 0        # must finish thread

        self.current_rserver_net_location = ''

        self.rserver_socket = None
        self.client_socket = client_socket

        self.client_address = address

        self.rserver_head_obj = None
        self.rserver_current_data_pos =0
        self.rserver_all_got = 0
        self.rserver_data_length = 0
        self.rserver_header_sent = 0
        self.rserver_data_sent = 0
        self.rserver_buffer = ''

        self.client_head_obj = None
        self.client_current_data_pos =0
        self.client_all_got = 0
        self.client_data_length = 0
        self.client_header_sent = 0
        self.client_data_sent = 0
        self.client_buffer = ''
        self.client_sent_data = ''

        # init record to debug_log
        self.logger.log('%s Version %s\n' % (time.strftime('%d.%m.%Y %H:%M:%S', time.localtime(time.time())), self.config['GENERAL']['VERSION']))

    #-----------------------------------------------------------------------
    def run(self):
        ""
        if self.config['DEBUG']['SCR_DEBUG']: print 'Connected from %s:%d' % self.client_address

        while(not self.stop_request):

            # wait for data
            if not (self.rserver_buffer or self.client_buffer):
                # if buffers are empty
                """
                if not self.rserver_socket_closed:
                    select.select([self.rserver_socket.fileno(), self.client_socket.fileno()], [], [], 5.0)
                else:
                    # if there is no connection to remote server
                    select.select([self.client_socket.fileno()], [], [], 5.0)
                """
                # Experimental code. We fight bug when we do not get all the header in the
                # first try and have stop request because rserver_socket_closed==1
                # So let's try change socket_closed to socket. which is None if there is no
                # connection
                if not self.rserver_socket_closed:
                    select.select([self.rserver_socket.fileno(), self.client_socket.fileno()], [], [], 5.0)
                else:
                    # if there is no connection to remote server
                    select.select([self.client_socket.fileno()], [], [], 5.0)

            # client part
            self.run_client_loop()

            if self.tunnel_mode: self.tunnel_client_data()

            if not self.client_header_sent and self.client_head_obj:
                if not self.rserver_socket_closed:
                    # if connected we have to check whether we are connected to the right host.
                    # if not then close connection
                    self.check_connected_remote_server()
                #if self.rserver_socket_closed:
                if self.rserver_socket_closed:
                    # connect remote server if we have not yet
                    self.connect_rserver()

                self.log_url()
                self.send_client_header()

            if self.client_header_sent and (not self.client_data_sent):
                self.send_client_data()

            if self.client_data_sent and self.rserver_data_sent:
                # NOTE: we need to know if the request method is HEAD or CONNECT, so we cannot
                # proceed to the next request header until response is not worked out
                self.check_tunnel_mode()
                self.reset_client()

            if self.config['DEBUG']['SCR_DEBUG']: print '\b.',

            # Remote server part
            if not self.rserver_socket_closed:
                # if there is a connection to remote server
                self.run_rserver_loop()

            if self.tunnel_mode: self.tunnel_rserver_data()

            if (not self.rserver_header_sent) and self.rserver_head_obj:
                self.auth_routine()                                # NTLM authorization

            if (not self.rserver_header_sent) and self.rserver_head_obj:
                self.send_rserver_header()
                self.check_rserver_response()

            if self.rserver_header_sent and (not self.rserver_data_sent):
                self.send_rserver_data()

            if self.client_head_obj == None and self.rserver_data_sent:
                self.reset_rserver()
                self.logger.log('*** Request completed.\n')

            self.check_stop_request()

        self.exit()
        if self.config['DEBUG']['SCR_DEBUG']: print 'Finished %s:%d' % self.client_address

    #-----------------------------------------------------------------------
    def fix_client_header(self):
        ""
        self.logger.log('*** Replacing values in client header...')
        if self.config.has_key('CLIENT_HEADER'):
            for i in self.config['CLIENT_HEADER'].keys():
                self.client_head_obj.del_param(i)
                self.client_head_obj.add_param_value(i, self.config['CLIENT_HEADER'][i])
            self.logger.log('Done.\n')
            self.logger.log('*** New client header:\n=====\n' + self.client_head_obj.__repr__())
        else:
            self.logger.log('No need.\n*** There is no "CLIENT_HEADER" section in server.cfg.\n')

    #-----------------------------------------------------------------------
    def run_rserver_loop(self):
        ""
        res = select.select([self.rserver_socket.fileno()], [], [], 0.0)
        if res[0]:
            try:
                socket_data = self.rserver_socket.recv(4096)
            except:
                socket_data = ''
                self.logger.log('*** Exception in remote server recv() happend.\n')

            if not socket_data:
                self.rserver_socket_closed = 1
                self.logger.log('*** Remote server closed connection. (Server buffer - %d bytes)\n' % len(self.rserver_buffer))
        else:
            socket_data = ''

        if socket_data:
            self.logger_bin_rserver.log(socket_data)

        self.rserver_buffer = self.rserver_buffer + socket_data

        if not self.rserver_head_obj and not self.tunnel_mode:
            self.rserver_head_obj, rest = http_header.extract_server_header(self.rserver_buffer)

            # Code for ugly MS response without right delimiter.
            # Just '\015\012' at the end. Then it closes connection.
            if self.rserver_socket_closed and self.rserver_buffer and (not self.rserver_head_obj):
                self.rserver_head_obj, rest = http_header.extract_server_header(self.rserver_buffer + '\015\012')
                if self.rserver_head_obj:
                    self.logger.log("*** There is an bad MS Proxy response header with only one new line at the end in the buffer.\n")
            # End of code.

            if self.rserver_head_obj:
                self.logger.log("*** Got remote server response header.\n")
                self.rserver_buffer = rest
                self.logger.log('*** Remote server header:\n=====\n' + self.rserver_head_obj.__repr__())
                self.guess_rserver_data_length()

        self.check_rserver_data_length()

    #-----------------------------------------------------------------------
    def run_client_loop(self):
        ""
        res = select.select([self.client_socket.fileno()], [], [], 0.0)
        if res[0]:
            try:
                socket_data = self.client_socket.recv(4096)
            except:
                socket_data = ''
                self.logger.log('*** Exception in client recv() happend.\n')

            if not socket_data:
                self.client_socket_closed = 1
                self.logger.log('*** Client closed connection.\n')

        else: socket_data = ''

        if socket_data:
            self.logger_bin_client.log(socket_data)

        self.client_buffer = self.client_buffer + socket_data

        if not self.client_head_obj and not self.tunnel_mode:
            self.client_head_obj, rest = http_header.extract_client_header(self.client_buffer)

            if self.client_head_obj:
                self.logger.log("*** Got client request header.\n")
                self.client_buffer = rest
                self.logger.log('*** Client header:\n=====\n' + self.client_head_obj.__repr__())
                self.guess_client_data_length()

                # mask real values and do transforms
                self.fix_client_header()

        self.check_client_data_length()

    #-----------------------------------------------------------------------
    def send_rserver_header(self):
        ""
        self.logger.log('*** Sending remote server response header to client...')
        ok = self.rserver_head_obj.send(self.client_socket)
        if ok:
            self.rserver_header_sent = 1
            self.logger.log('Done.\n')

        else:
            self.client_socket_closed = 1
            self.logger.log('Failed.\n')

    #-----------------------------------------------------------------------
    def send_rserver_data(self):
        ""
        if self.rserver_buffer and (not self.rserver_data_sent):
            if self.rserver_data_length:
                if self.rserver_all_got:
                    data = self.rserver_buffer[:self.rserver_data_length - self.rserver_current_data_pos]
                    self.rserver_buffer = self.rserver_buffer[self.rserver_data_length - self.rserver_current_data_pos:]
                else:
                    data = self.rserver_buffer
                    self.rserver_buffer = ''
                self.rserver_current_data_pos = self.rserver_current_data_pos + len(data)
            else:
                data = self.rserver_buffer
                self.rserver_buffer = ''

            try:
                self.client_socket.send(data)
                self.logger.log('*** Sent %d bytes to client. (all - %d, len - %d)\n' % (len(data), self.rserver_all_got, self.rserver_data_length))
                if self.rserver_all_got:
                    self.rserver_data_sent = 1
                    self.logger.log('*** Sent ALL the data from remote server to client. (Server buffer - %d bytes)\n' % len(self.rserver_buffer))
            except:
                self.logger.log('*** Exception by sending data to client. Client closed connection.\n')
                self.client_socket_closed = 1
        else:
            self.logger.log("*** No server's data to send to the client. (server's buffer - %d bytes)\n" % len(self.rserver_buffer))
    #-----------------------------------------------------------------------
    def send_client_header(self):
        ""
        self.logger.log('*** Sending client request header to remote server...')
        ok = self.client_head_obj.send(self.rserver_socket)
        if ok:
            self.client_header_sent = 1
            self.logger.log('Done.\n')
        else:
            self.rserver_socket_closed = 1
            self.logger.log('Failed.\n')

    #-----------------------------------------------------------------------
    def send_client_data(self):
        ""
        if self.client_buffer and (not self.client_data_sent):
            if self.client_data_length:
                if self.client_all_got:
                    data = self.client_buffer[:self.client_data_length - self.client_current_data_pos]
                    self.client_buffer = self.client_buffer[self.client_data_length - self.client_current_data_pos:]
                else:
                    data = self.client_buffer
                    self.client_buffer = ''
                self.client_current_data_pos = self.client_current_data_pos + len(data)
            else:
                data = self.client_buffer
                self.client_buffer = ''

            try:
                self.rserver_socket.send(data)
                self.client_sent_data = self.client_sent_data + data
                self.logger.log('*** Sent %d bytes to remote server. (all - %d)\n' % (len(data), self.client_all_got))
                if self.client_all_got:
                    self.client_data_sent = 1
                    self.logger.log('*** Sent ALL the data from client to remote server. (Client buffer - %d bytes)\n' % len(self.client_buffer))
            except:
                self.logger.log('*** Exception during sending data to remote server. Remote server closed connection.\n')
                self.rserver_socket_closed = 1

    #-----------------------------------------------------------------------
    def reset_rserver(self):
        ""
        self.logger.log('*** Resetting remote server status...')
        self.rserver_head_obj = None

        self.rserver_current_data_pos =0
        self.rserver_all_got = 0
        self.rserver_data_length = 0
        self.rserver_header_sent = 0
        self.rserver_data_sent = 0
        #self.rserver_buffer = ''

        self.logger.log('Done. (Server buffer - %d bytes)\n' % len(self.rserver_buffer))

    #-----------------------------------------------------------------------
    def reset_client(self):
        ""
        self.logger.log('*** Resetting client status...')
        self.client_head_obj = None

        self.client_current_data_pos =0
        self.client_all_got = 0
        self.client_data_length = 0
        self.client_header_sent = 0
        self.client_data_sent = 0
        #self.client_buffer = ''
        self.client_sent_data = ''

        self.logger.log('Done. (Client buffer - %d bytes)\n' % len(self.client_buffer))


    #-----------------------------------------------------------------------
    def rollback_client_data(self):
        ""
        # some activity for POST and PUT getting to work with authorization
        # part of data might be sent before we have got 407 error
        # so we have to get those data back
        if self.client_sent_data:
            self.logger.log("*** Sent %s bytes and have to roll back POST/PUT data transfer. (Client's buffer - %d bytes)\n" % (len(self.client_sent_data), len(self.client_buffer)))
            self.client_buffer = self.client_sent_data + self.client_buffer
            self.client_current_data_pos =0
            self.client_all_got = 0
            self.client_data_sent = 0
            self.client_sent_data = ''
            self.logger.log("Rollback Done. (Client's buffer - %d bytes)\n" % len(self.client_buffer))

    #-----------------------------------------------------------------------
    def tunnel_rserver_data(self):
        ""
        if self.rserver_buffer:
            data = self.rserver_buffer
            self.rserver_buffer = ''
            try:
                self.client_socket.send(data)
                self.logger.log('*** Tunnelled %d bytes to client.\n' % len(data))
            except:
                self.logger.log('*** Exception by tunnelling data to client. Client closed connection.\n')
                self.client_socket_closed = 1

    #-----------------------------------------------------------------------
    def tunnel_client_data(self):
        ""
        if self.client_buffer:
            data = self.client_buffer
            self.client_buffer = ''
            try:
                self.rserver_socket.send(data)
                self.logger.log('*** Tunnelled %d bytes to remote server.\n' % len(data))
            except:
                self.logger.log('*** Exception by tunnelling data to remote server. Remote server closed connection.\n')
                self.rserver_socket_closed = 1

    #-----------------------------------------------------------------------
    def guess_rserver_data_length(self):
        ""
        code = self.rserver_head_obj.get_http_code()
        c_method = self.client_head_obj.get_http_method()

        if code == '304' or code == '204' or code[0] == '1':
            self.rserver_all_got = 1
            self.rserver_data_sent = 1
            self.rserver_data_length = 0
            self.logger.log('*** Remote server response is %s and it must not have any body.\n' % code)

        # we had problem here if the responce was some kind of error. Then there may be
        # some body.
        # This time let's try to check for 4** responses to fix the problem.
        if (c_method == 'HEAD' or c_method == 'CONNECT') and (code[0] != '4'):
            self.rserver_all_got = 1
            self.rserver_data_sent = 1
            self.rserver_data_length = 0
            self.logger.log("*** Remote server response to the '%s' request. It must not have any body.\n" % c_method)

        if not self.rserver_all_got:
            try:
                self.rserver_data_length = int(self.rserver_head_obj.get_param_values('Content-Length')[0])
                self.logger.log("*** Server 'Content-Length' found to be %d.\n" % self.rserver_data_length)
                if self.rserver_data_length == 0:
                    self.rserver_all_got = 1
                    self.rserver_data_sent = 1
            except:
                self.rserver_data_length = 0
                self.logger.log("*** Could not find server 'Content-Length' parameter.\n")

    #-----------------------------------------------------------------------
    def guess_client_data_length(self):
        ""
        if not self.client_head_obj.has_param('Content-Length') and not self.client_head_obj.has_param('Transfer-Encode'):
            self.client_all_got = 1
            self.client_data_sent = 1
            self.client_data_length = 0
            self.logger.log("*** Client request header does not have 'Content-Length' or 'Transfer-Encoding' parameter and it must not have any body.\n")

        if not self.client_all_got:
            try:
                self.client_data_length = int(self.client_head_obj.get_param_values('Content-Length')[0])
                self.logger.log("*** Client 'Content-Length' found to be %s.\n" % self.client_data_length)
                if self.client_data_length == 0:
                    self.client_all_got = 1
                    self.client_data_sent = 1
            except:
                self.client_data_length = 0
                self.logger.log("*** Could not find client 'Content-Length' parameter.\n")

    #-----------------------------------------------------------------------
    def check_rserver_data_length(self):
        ""
        if self.rserver_data_length:
            if self.rserver_data_length <= (len(self.rserver_buffer) + self.rserver_current_data_pos):
                self.rserver_all_got = 1

    #-----------------------------------------------------------------------
    def check_client_data_length(self):
        ""
        if self.client_data_length:
            if self.client_data_length <= (len(self.client_buffer) + self.client_current_data_pos):
                self.client_all_got = 1

    #-----------------------------------------------------------------------
    def check_tunnel_mode(self):
        ""
        p_code = self.rserver_head_obj.get_http_code()
        c_request = self.client_head_obj.get_http_method()
        if c_request == 'CONNECT' and p_code == '200':
            self.logger.log("*** Successful 'CONNECT' request detected. Going to tunnel mode.\n")
            self.tunnel_mode = 1

    #-----------------------------------------------------------------------
    def log_url(self):
        ""
        if self.config['GENERAL']['URL_LOG']:
            t = time.strftime('%d.%m.%Y %H:%M:%S', time.localtime(time.time()))
            m = self.client_head_obj.get_http_method()
            url = self.client_head_obj.get_http_url()
            v = self.client_head_obj.get_http_version()
            p1 = '%s  %s %s %s ' % (t, m, url, v)
            p2 = '(from %s:%s)' % self.client_address

            self.config['GENERAL']['URL_LOG_LOCK'].acquire()
            self.config['GENERAL']['URL_LOGGER'].log(p1 + p2 + '\n')
            self.config['GENERAL']['URL_LOG_LOCK'].release()

    #-----------------------------------------------------------------------
    def check_stop_request(self):
        ""
        reason = ''
        if self.rserver_socket_closed and not self.first_run:
            self.stop_request = 1
            reason = "remote server closed connection"

            if self.rserver_head_obj:
                # if we POSTing or PUTting some info and Proxy closed connection
                # with error 407, we would like to try to authorize ourselves before giving up.
                if (not self.proxy_authorization_tried) and self.rserver_head_obj.get_http_code() == '407':
                   self.stop_request = 0
                if (not self.www_authorization_tried) and self.rserver_head_obj.get_http_code() == '401':
                   self.stop_request = 0

        if self.client_socket_closed:
            self.stop_request = 1
            reason = "client closed connection"

        if self.rserver_socket_closed and self.client_socket_closed:
            # actually redundant case, but anyway...
            self.stop_request = 1
            reason = "remote server and client closed connections"

        if self.stop_request:
            self.logger.log("*** Termination conditions detected (%s). Stop Request issued.\n" % reason)

    #-----------------------------------------------------------------------
    def exit(self):
        ""
        self.logger.log('*** Finishing procedure started.\n')
        if self.rserver_socket_closed and self.rserver_buffer and (not self.client_socket_closed):
            self.logger.log('*** There are some data to be sent to client in the remote server buffer.\n')
            self.tunnel_rserver_data()

        if self.client_socket_closed and self.client_buffer and (not self.rserver_socket_closed):
            self.logger.log('*** There are some data to be sent to remote server in the client buffer.\n')
            self.tunnel_client_data()

        self.logger.log('*** Closing thread...')

        if self.client_socket:
            self.client_socket.close()
        if self.rserver_socket:
            self.rserver_socket.close()

        self.logger.log('Done.\n')
        # thread.exit()

    #-------------------------------------------------
    def connect_rserver(self):
        ""
        self.logger.log('*** Connecting to remote server...')
        self.first_run = 0

        rs = self.config['GENERAL']['PARENT_PROXY']
        rsp = self.config['GENERAL']['PARENT_PROXY_PORT']

        self.logger.log('(%s:%d)...' % (rs, rsp))

        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect((rs, rsp))
            self.rserver_socket = s
            self.rserver_socket_closed = 0
            self.current_rserver_net_location = '%s:%d' % (rs, rsp)
            self.logger.log('Done.\n')
        except:
            self.rserver_socket_closed = 1
            self.logger.log('Failed.\n')
            self.exit()
            thread.exit()

    #-------------------------------------------------
    def close_rserver(self):
        ""
        self.logger.log('*** Closing connection to the remote server...')
        self.rserver_socket.close()
        self.rserver_socket_closed = 1
        self.current_rserver_net_location = ''
        self.logger.log('Done.\n')

    #-------------------------------------------------
    def close_client(self):
        ""
        self.logger.log('*** Closing connection to the client...')
        self.client_socket.close()
        self.client_socket_closed = 1
        self.logger.log('Done.\n')

    #-----------------------------------------------------------------------
    def auth_407(self):
        ""
        auth = self.rserver_head_obj.get_param_values('Proxy-Authenticate')
        upper_auth = []
        msg = ''
        for i in auth:
            msg = msg + ", %s" % i
            upper_auth.append(string.upper(i))
        self.logger.log('*** Authentication methods allowed: ' + msg[2:] + '\n')

        # NOTE that failed auth is detected now just after any failed atempt.
        # May it will be of use to keep trying till all the methods will fail.
        if self.proxy_authorization_tried:
            self.logger.log('*** Looks like our authorization failed.\n*** Passing 407 to client.\n')

        else:
            self.proxy_authorization_tried =  1
            self.rollback_client_data()

            # Method selector. Should try the most secure method.
            if 'NTLM' in upper_auth:
                self.logger.log('*** Using NTLM authentication method.\n')
                #self.proxy_ntlm_authorization()
                self.ntlm_auther.proxy_ntlm_authentication(self)

            elif 'BASIC_' in upper_auth:
                self.logger.log('*** Using Basic authentication method.\n')
                #self.basic_authorization()
                self.basic_auther.proxy_basic_authentication(self)

            else:
                self.logger.log('*** There are no supported authentication methods in remote server response.\n')
                self.logger.log('*** Passing 407 to client.\n')

    #-----------------------------------------------------------------------
    def auth_401(self):
        ""
        auth = self.rserver_head_obj.get_param_values('Www-Authenticate')
        upper_auth = []
        msg = ''
        for i in auth:
            msg = msg + ", %s" % i
            upper_auth.append(string.upper(i))
        self.logger.log('*** Authentication methods allowed: ' + msg[2:] + '\n')

        # NOTE that failed auth is detected now just after any failed atempt.
        # May it will be of use to keep trying till all the methods will fail.
        if self.www_authorization_tried:
            self.logger.log('*** Looks like our authorization failed.\n*** Passing 401 to client.\n')

        else:
            self.www_authorization_tried =  1
            self.rollback_client_data()

            # Method selector. Should try the most secure method.
            if 'NTLM' in upper_auth:
                self.logger.log('*** Using NTLM authentication method.\n')
                #self.www_ntlm_authorization()
                self.ntlm_auther.www_ntlm_authentication(self)

            elif 'BASIC_' in upper_auth:
                self.logger.log('*** Using Basic authentication method.\n')
                #self.basic_authorization()
                self.basic_auther.www_basic_authentication(self)

            else:
                self.logger.log('*** There are no supported authentication methods in the Web Server response.\n')
                self.logger.log('*** Passing 401 to client.\n')

    #-----------------------------------------------------------------------
    def auth_routine(self):
        ""
        self.logger.log('*** Authentication routine started.\n')
        code = self.rserver_head_obj.get_http_code()

        if code == '407':
            self.logger.log('*** Got Error 407 - "Proxy authentication required".\n')
            self.auth_407()

        elif code == '401':
            self.logger.log('*** Got Error 401 - "WWW authentication required".\n')
            self.auth_401()

        else:
            self.logger.log('*** Authentication not required.\n')

        self.logger.log('*** Authentication routine finished.\n')

    #-----------------------------------------------------------------------
    def check_rserver_response(self):
        ""
        if self.rserver_header_sent == 1:
            code = self.rserver_head_obj.get_http_code()
            if  code == '100':
                # reaction on response '100' - 'Continue'
                self.logger.log("*** Got and sent to client response '100'. Need to prepare for final response.\n")
                self.reset_rserver()

            if code not in ['401', '407']:
                # if we have at least one request successfully served
                # then we have to clear up authentication flags to be ready
                # to authenticate yourself again if there is such a need
                if self.proxy_authorization_tried or self.www_authorization_tried:
                    self.proxy_authorization_tried = 0
                    self.www_authorization_tried = 0
                    self.logger.log('*** Lowered authentication flags down. As the code is neither 401 nor 407.\n')


    #-----------------------------------------------------------------------
    # Need not for proxy module...
    def check_connected_remote_server(self):
        ""
        pass

