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

import time

#-----------------------------------------------------------------------
class Logger:
    "provides facility for loggin messages during runtime"

    #-----------------------------------------------------------------------
    def __init__(self, log_name, debug_level = 1):
        "logger init routine"

        self.log_name = log_name
        self.debug_level = debug_level

    #-----------------------------------------------------------------------
    def log(self, str):
        "writes string to log file"

        if self.debug_level:

            tstr = ''
            # tstr = '(' + time.strftime('%H:%M:%S', time.localtime(time.time())) + ') '
            # time.clock()

            fptr = open(self.log_name, 'a')
            fptr.write(tstr + str)
            fptr.close()
