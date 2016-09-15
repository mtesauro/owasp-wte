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

import socket, thread, string, sys
import logger

#-------------------------------------------------------------------------
def arrange(conf):
    ""

    #-----------------------------------------------
    # GENERAL
    conf['GENERAL']['PARENT_PROXY']

    # if we do not use proxy then we do not need its port
    if conf['GENERAL']['PARENT_PROXY']:
        conf['GENERAL']['PARENT_PROXY_PORT'] = int(conf['GENERAL']['PARENT_PROXY_PORT'])

    try:
        conf['GENERAL']['LISTEN_PORT'] = int(conf['GENERAL']['LISTEN_PORT'])
    except:
        print "ERROR: There is a problem with 'LISTEN_PORT' in the config."
        print "Exit."
        sys.exit()

    conf['GENERAL']['HOST'] = socket.gethostname()
    conf['GENERAL']['HOST_IP_LIST'] = socket.gethostbyname_ex(socket.gethostname())[2] + ['127.0.0.1']

    conf['GENERAL']['ALLOW_EXTERNAL_CLIENTS'] = int(conf['GENERAL']['ALLOW_EXTERNAL_CLIENTS'])
    conf['GENERAL']['FRIENDLY_IPS'] = conf['GENERAL']['HOST_IP_LIST'] + string.split(conf['GENERAL']['FRIENDLY_IPS'])

    conf['GENERAL']['URL_LOG'] = int(conf['GENERAL']['URL_LOG'])
    url_logger = logger.Logger('url.log', conf['GENERAL']['URL_LOG'])
    url_logger_lock = thread.allocate_lock()
    conf['GENERAL']['URL_LOGGER'] = url_logger
    conf['GENERAL']['URL_LOG_LOCK'] = url_logger_lock


    #-----------------------------------------------
    # NTLM_AUTH
    if not conf['NTLM_AUTH'].has_key('NTLM_FLAGS'):
        conf['NTLM_AUTH']['NTLM_FLAGS'] = ''
    try:
        #conf['NTLM']['FULL_NTLM'] = int(conf['NTLM']['FULL_NTLM'])
        conf['NTLM_AUTH']['LM_PART'] = int(conf['NTLM_AUTH']['LM_PART'])
        conf['NTLM_AUTH']['NT_PART'] = int(conf['NTLM_AUTH']['NT_PART'])
        conf['NTLM_AUTH']['USER']
        conf['NTLM_AUTH']['PASSWORD']

        if not conf['NTLM_AUTH']['NT_DOMAIN']:
            print "ERROR: NT DOMAIN must be set."
            print "Exit."
            sys.exit()
    except:
        print "ERROR: There is a problem with [NTLM] section in the config."
        print "Exit."
        sys.exit()


    #-----------------------------------------------
    # DEBUG
    try:
        conf['DEBUG']['DEBUG'] = int(conf['DEBUG']['DEBUG'])
        conf['DEBUG']['AUTH_DEBUG'] = int(conf['DEBUG']['AUTH_DEBUG'])
        conf['DEBUG']['BIN_DEBUG'] = int(conf['DEBUG']['BIN_DEBUG'])
    except:
        print "ERROR: There is a problem with [DEBUG] section in the config."
        print "Exit."
        sys.exit()

    # screen activity
    if conf['DEBUG'].has_key('SCR_DEBUG'):
           conf['DEBUG']['SCR_DEBUG'] = int(conf['DEBUG']['SCR_DEBUG'])
    else:
        conf['DEBUG']['SCR_DEBUG'] = 0

    return conf

