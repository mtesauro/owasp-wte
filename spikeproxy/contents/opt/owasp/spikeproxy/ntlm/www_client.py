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
import proxy_client

class www_HTTP_Client(proxy_client.proxy_HTTP_Client):

    #-------------------------------------------------
    def connect_rserver(self):
        ""
        self.logger.log('*** Connecting to remote server...')
        self.first_run = 0

        # we don't have proxy then we have to connect server by ourselves
        rs, rsp = self.client_head_obj.get_http_server()

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

    #-----------------------------------------------------------------------
    def fix_client_header(self):
        ""
        self.logger.log('*** Replacing values in client header...')
        if self.config.has_key('CLIENT_HEADER'):
            for i in self.config['CLIENT_HEADER'].keys():
                self.client_head_obj.del_param(i)
                self.client_head_obj.add_param_value(i, self.config['CLIENT_HEADER'][i])
            self.logger.log('Done.\n')
            # self.logger.log('*** New client header:\n=====\n' + self.client_head_obj.__repr__())
        else:
            self.logger.log('No need.\n*** There is no "CLIENT_HEADER" section in server.cfg.\n')

        self.logger.log("*** Working as selfcontained proxy, then have to change client header.\n")
        self.logger.log("*** Remake url format in client header...")
        self.client_head_obj.make_right_header()
        self.logger.log('Done.\n')
        self.client_head_obj.del_param('Keep-Alive')
        self.logger.log("*** Just killed 'Keep-Alive' value in the header.\n")

        # Code which converts 'Proxy-Connection' value to 'Connection'
        # I am not sure that it is needed at all
        # May be it is just useless activity
        self.logger.log("*** Looking for 'Proxy-Connection' in client header...")
        pconnection = self.client_head_obj.get_param_values('Proxy-Connection')
        if pconnection:
            # if we have 'Proxy-Connection'
            self.logger.log("there are some.\n")
            wconnection = self.client_head_obj.get_param_values('Connection')
            if wconnection:
                # if we have 'Connection' as well
                self.logger.log("*** There is a 'Connection' value in the header.\n")
                self.client_head_obj.del_param('Proxy-Connection')
                self.logger.log("*** Just killed 'Proxy-Connection' value in the header.\n")
            else:
                self.logger.log("*** There is no 'Connection' value in the header.\n")
                self.client_head_obj.del_param('Proxy-Connection')
                for i in pconnection:
                    self.client_head_obj.add_param_value('Connection', i)
                self.logger.log("*** Changed 'Proxy-Connection' to 'Connection' header value.\n")

        else:
            self.logger.log("there aren't any.\n")

        # End of doubtable code.

        # Show reworked header.
        self.logger.log('*** New client header:\n=====\n' + self.client_head_obj.__repr__())

    #-----------------------------------------------------------------------
    def check_connected_remote_server(self):
        ""
        # if we are working as a standalone proxy server
        rs, rsp = self.client_head_obj.get_http_server()
        if self.current_rserver_net_location != '%s:%d' % (rs, rsp):
            # if current connection is not we need then close it.
            self.logger.log('*** We had wrong connection for new request so we have to close it.\n')
            self.close_rserver()


