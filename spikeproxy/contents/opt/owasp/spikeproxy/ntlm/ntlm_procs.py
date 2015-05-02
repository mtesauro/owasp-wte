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

import string
import des, md4, ntlmutils

#---------------------------------------------------------------------
#takes a 21 byte array and treats it as 3 56-bit DES keys. The
#8 byte plaintext is encrypted with each key and the resulting 24
#bytes are stored in the result array

def calc_resp(keys_str, plain_text):
    "keys_str - hashed password"
    "plain_text - nonce from server"
    res = ''
    dobj = des.DES(keys_str[0:7])
    res = res + dobj.encrypt(plain_text[0:8])

    dobj = des.DES(keys_str[7:14])
    res = res + dobj.encrypt(plain_text[0:8])

    dobj = des.DES(keys_str[14:21])
    res = res + dobj.encrypt(plain_text[0:8])

    return res

#---------------------------------------------------------------------
def create_LM_hashed_password(passwd):
    "setup LanManager password"
    "create LanManager hashed password"

    lm_pw = '\000' * 14

    passwd = string.upper(passwd)

    if len(passwd) < 14:
        lm_pw = passwd + lm_pw[len(passwd) - 14:]
    else: lm_pw = passwd[0:14]

    # do hash

    magic_lst = [0x4B, 0x47, 0x53, 0x21, 0x40, 0x23, 0x24, 0x25]
    magic_str = ntlmutils.lst2str(magic_lst)

    res = ''
    dobj = des.DES(lm_pw[0:7])
    res = res + dobj.encrypt(magic_str)

    dobj = des.DES(lm_pw[7:14])
    res = res + dobj.encrypt(magic_str)

    # addig zeros to get 21 bytes string
    res = res + '\000\000\000\000\000'

    return res
#---------------------------------------------------------------------
def create_NT_hashed_password(passwd):
    "create NT hashed password"

    # we have to have UNICODE password
    pw = ntlmutils.str2unicode(passwd)

    # do MD4 hash
    md4_context = md4.new()
    md4_context.update(pw)

    res = md4_context.digest()

    # addig zeros to get 21 bytes string
    res = res + '\000\000\000\000\000'

    return res

