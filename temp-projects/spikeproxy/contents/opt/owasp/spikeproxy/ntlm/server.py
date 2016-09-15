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

import socket, thread, sys
import proxy_client, www_client

#--------------------------------------------------------------
class AuthProxyServer:
    pass

    #--------------------------------------------------------------
    def __init__(self, config):
        ""
        self.config = config
        self.MyHost = ''
        self.ListenPort = self.config['GENERAL']['LISTEN_PORT']

    #--------------------------------------------------------------
    def run(self):
        ""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.bind((self.MyHost, self.ListenPort))
        except:
            print "ERROR: Could not create socket. Possible it is used by other process."
            print "Bye."
            sys.exit()

        while(1):
            s.listen(5)
            conn, addr = s.accept()
            if self.config['GENERAL']['ALLOW_EXTERNAL_CLIENTS']:
                self.client_run(conn, addr)
            else:
                if addr[0] in self.config['GENERAL']['FRIENDLY_IPS']:
                    self.client_run(conn, addr)
                else:
                    conn.close()

        s.close()

    #--------------------------------------------------------------
    def client_run(self, conn, addr):
        ""
        if self.config['GENERAL']['PARENT_PROXY']:
            # working with MS Proxy
            c = proxy_client.proxy_HTTP_Client(conn, addr, self.config)
        else:
            # working with MS IIS and any other
            c = www_client.www_HTTP_Client(conn, addr, self.config)

        thread.start_new_thread(c.run, ())

