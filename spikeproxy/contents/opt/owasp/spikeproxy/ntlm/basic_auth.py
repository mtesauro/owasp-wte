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

import base64

class basic_auther:

    #-----------------------------------------------------------------------
    def __init__(self):
        ""
        pass

    #-----------------------------------------------------------------------
    def build_credentials(config_dic):
        ""

        msg = config_dic['USER'] + ":" + config_dic['PASSWORD']
        msg = base64.encodestring(msg)
        msg = string.replace(msg3, '\012', '')

        return msg

    #-----------------------------------------------------------------------
    def proxy_basic_authentication(self, connection):
        ""
        connection.logger.log('*** Basic authorization in progress...\n')

        connection.close_rserver()
        connection.connect_rserver()

        connection.reset_rserver()
        connection.rserver_buffer = ''
        connection.logger.log('*** Remote server buffer flushed.\n')

        basic_string = self.build_credentials(connection.config['GENERAL'])

        tmp_client_head_obj = connection.client_head_obj.copy()
        tmp_client_head_obj.replace_param_value('Proxy-Authorization', 'Basic ' + basic_sting)

        connection.logger.log('*** Sending client header (not body) with Basic auth...')
        tmp_client_head_obj.send(connection.rserver_socket)
        connection.logger.log('Done.\n')
        connection.logger.log('*** New client header with Basic auth:\n=====\n' + tmp_client_head_obj.__repr__())

        # upon exit all the remote server variables are reset
        # so new remote server response will be taken by the usual way in connection.run()
        connection.logger.log('*** End of Basic authorization process.\n')

    #-----------------------------------------------------------------------
    def www_basic_authentication(self, connection):
        ""
        connection.logger.log('*** Basic authorization in progress...\n')

        connection.close_rserver()
        connection.connect_rserver()

        connection.reset_rserver()
        connection.rserver_buffer = ''
        connection.logger.log('*** Remote server buffer flushed.\n')

        basic_string = self.build_credentials(connection.config['GENERAL'])

        tmp_client_head_obj = connection.client_head_obj.copy()
        tmp_client_head_obj.replace_param_value('Authorization', 'Basic ' + basic_sting)

        connection.logger.log('*** Sending client header (not body) with Basic auth...')
        tmp_client_head_obj.send(connection.rserver_socket)
        connection.logger.log('Done.\n')
        connection.logger.log('*** New client header with Basic auth:\n=====\n' + tmp_client_head_obj.__repr__())

        # upon exit all the remote server variables are reset
        # so new remote server response will be taken by the usual way in connection.run()
        connection.logger.log('*** End of Basic authorization process.\n')

