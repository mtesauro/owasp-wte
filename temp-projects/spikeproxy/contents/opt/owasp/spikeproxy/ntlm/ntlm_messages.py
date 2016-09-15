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

import ntlm_procs, ntlmutils
import base64, string

#---------------------------------------------------------------------
class record:

    def __init__(self, data, offset=0):
        ""
        self.data = data
        self.len = len(data)
        self.offset = 0
        self.next_offset = self.offset + self.len

    #---------------------------------------------------------------------
    # helper function for creation info field in message 3
    def create_record_info(self, offset):
        ""
        self.offset = offset
        len1 = ntlmutils.int2chrs(self.len)
        len2 = len1
        data_off = ntlmutils.int2chrs(self.offset)
        self.record_info = len1 + len2 + data_off + '\000\000'

        # looks like the length is always = 8 bytes
        self.next_offset = offset + self.len

#---------------------------------------------------------------------
def create_message1(environment_dict):
    ""
    ed = environment_dict
    # overall lenght = 48 bytes
    protocol = 'NTLMSSP\000'    #name
    type = '\001\000'               #type 1
    zeros1 = '\000\000'

    flags = ntlmutils.hex2str(ed['FLAGS'])

    zeros2 = '\000\000\000\000\000\000\000\000\000'
    zeros3 = '\000\000\000\000\000\000\000\000\000\000\000'
    smthg1 = '0\000\000\000\000\000\000\000'    # something with chr(48) length?
    smthg2 = '0\000\000\000'                    # something with chr(48) lenght?

    msg1 = protocol + type + zeros1 + flags + zeros2 + zeros3 + smthg1 + smthg2
    msg1 = base64.encodestring(msg1)
    msg1 = string.replace(msg1, '\012', '')

    return msg1

#---------------------------------------------------------------------
def create_message3(nonce, environment_dict):
    ""
    ed = environment_dict

    flags = ntlmutils.hex2str(ed['FLAGS'])

    protocol = 'NTLMSSP\000'            #name
    type = '\003\000'                   #type 3
    head = protocol + type + '\000\000'

    domain_rec = record(ed['DOMAIN'])
    user_rec = record(ed['USER'])
    host_rec = record(ed['HOST'])

    additional_rec = record('')

    if ed['LM']:
        lm_rec = record(ntlm_procs.calc_resp(ed['LM_HASHED_PW'], nonce))
    else:
        lm_rec = record('')

    if ed['NT']:
        nt_rec = record(ntlm_procs.calc_resp(ed['NT_HASHED_PW'], nonce))
    else:
        nt_rec = record('')

    # length of the head and five infos for LM, NT, Domain, User, Host
    domain_offset = len(head) + 5 * 8

    # and unknown record info and flags' lenght
    if ed['NTLM_MODE'] == 0:
        domain_offset = domain_offset + 8 + len(flags)

    # create info fields
    domain_rec.create_record_info(domain_offset)
    user_rec.create_record_info(domain_rec.next_offset)
    host_rec.create_record_info(user_rec.next_offset)
    lm_rec.create_record_info(host_rec.next_offset)
    nt_rec.create_record_info(lm_rec.next_offset)
    additional_rec.create_record_info(nt_rec.next_offset)

    # data part of the message 3
    data_part = domain_rec.data + user_rec.data + host_rec.data + lm_rec.data + nt_rec.data

    # build message 3
    m3 = head + lm_rec.record_info + nt_rec.record_info + domain_rec.record_info + \
         user_rec.record_info + host_rec.record_info

    # Experimental feature !!!
    if ed['NTLM_MODE'] == 0:
        m3 = m3 + additional_rec.record_info + flags

    m3 = m3 + data_part

    # Experimental feature !!!
    if ed['NTLM_MODE'] == 0:
        m3 = m3 + additional_rec.data

    # base64 encode
    m3 = base64.encodestring(m3)
    m3 = string.replace(m3, '\012', '')

    return m3

#---------------------------------------------------------------------
def parse_message2(msg2):
    ""
    msg2 = base64.decodestring(msg2)
    # protocol = msg2[0:7]
    # msg_type = msg2[7:9]
    nonce = msg2[24:32]

    return nonce

#---------------------------------------------------------------------
def item(item_str):
    ""
    item = {}
    res = ''
    item['len1'] = ntlmutils.bytes2int(item_str[0:2])
    item['len2'] = ntlmutils.bytes2int(item_str[2:4])
    item['offset'] = ntlmutils.bytes2int(item_str[4:6])

    res = res + '%s\n\nlength (two times), offset, delimiter\n' % (ntlmutils.str2hex(item_str))

    res = res + '%s decimal: %3d    # length 1\n' % (ntlmutils.int2hex_str(item['len1']), item['len1'])
    res = res + '%s decimal: %3d    # length 2\n' % (ntlmutils.int2hex_str(item['len2']), item['len2'])
    res = res + '%s decimal: %3d    # offset\n' % (ntlmutils.int2hex_str(item['offset']), item['offset'])
    res = res + '%s                   # delimiter (two zeros)\n\n' % ntlmutils.str2hex(item_str[-2:])
    item['string'] = res

    return item

#---------------------------------------------------------------------
def flags(flag_str):
    ""
    res = ''
    res = res + '%s\n\n' % ntlmutils.str2hex(flag_str)
    flags = ntlmutils.bytes2int(flag_str[0:2])
    res = res + '%s                   # flags\n' % (ntlmutils.int2hex_str(flags))
    res = res + 'Binary:\nlayout 87654321 87654321\n'
    res = res + '       %s %s\n' % (ntlmutils.byte2bin_str(flag_str[1]), ntlmutils.byte2bin_str(flag_str[0]))

    flags2 = ntlmutils.bytes2int(flag_str[2:4])
    res = res + '%s                   # more flags ???\n' % (ntlmutils.int2hex_str(flags2))
    res = res + 'Binary:\nlayout 87654321 87654321\n'
    res = res + '       %s %s\n' % (ntlmutils.byte2bin_str(flag_str[3]), ntlmutils.byte2bin_str(flag_str[2]))

    #res = res + '%s                   # delimiter ???\n' % m_hex[(cur + 2) * 2: (cur + 4) * 2]

    return res

#---------------------------------------------------------------------
def unknown_part(bin_str):
    ""
    res = ''
    res = res + 'Hex    :  %s\n' % ntlmutils.str2hex(bin_str, '  ')
    res = res + 'String :   %s\n' % ntlmutils.str2prn_str(bin_str, '   ')
    res = res + 'Decimal: %s\n' % ntlmutils.str2dec(bin_str, ' ')

    return res

#---------------------------------------------------------------------
def debug_message1(msg):
    ""
    m_ = base64.decodestring(msg)
    m_hex = ntlmutils.str2hex(m_)

    res = ''
    res = res + '==============================================================\n'
    res = res + 'NTLM Message 1 report:\n'
    res = res + '---------------------------------\n'
    res = res + 'Base64: %s\n' % msg
    res = res + 'String: %s\n' % ntlmutils.str2prn_str(m_)
    res = res + 'Hex: %s\n' % m_hex
    cur = 0

    res = res + '---------------------------------\n'
    cur_len = 12
    res = res + 'Header %d/%d:\n%s\n\n' % (cur, cur_len, m_hex[0:24])
    res = res + '%s\nmethod name 0/8\n%s               # C string\n\n' % (m_hex[0:16], ntlmutils.str2prn_str(m_[0:8]))
    res = res + '0x%s%s                 # message type\n' % (m_hex[18:20], m_hex[16:18])
    res = res + '%s                   # delimiter (zeros)\n' % m_hex[20:24]
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = 4
    res = res + 'Flags %d/%d\n' % (cur, cur_len)
    res = res + flags(m_[cur: cur + cur_len])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = len(m_) - cur
    res = res + 'Rest of the message %d/%d:\n' % (cur, cur_len)
    res = res + unknown_part(m_[cur: cur + cur_len])

    res = res + '\nEnd of message 1 report.\n'

    return res

#---------------------------------------------------------------------
def debug_message2(msg):
    ""
    m_ = base64.decodestring(msg)
    m_hex = ntlmutils.str2hex(m_)
    res = ''
    res = res + '==============================================================\n'
    res = res + 'NTLM Message 2 report:\n'
    res = res + '---------------------------------\n'
    res = res + 'Base64: %s\n' % msg
    res = res + 'String: %s\n' % ntlmutils.str2prn_str(m_)
    res = res + 'Hex: %s\n' % m_hex
    cur = 0

    res = res + '---------------------------------\n'
    cur_len = 12
    res = res + 'Header %d/%d:\n%s\n\n' % (cur, cur_len, m_hex[0:24])
    res = res + '%s\nmethod name 0/8\n%s               # C string\n\n' % (m_hex[0:16], ntlmutils.str2prn_str(m_[0:8]))
    res = res + '0x%s%s                 # message type\n' % (m_hex[18:20], m_hex[16:18])
    res = res + '%s                   # delimiter (zeros)\n' % m_hex[20:24]
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = 8
    res = res + 'Lengths and Positions %d/%d\n%s\n\n' % (cur, cur_len, m_hex[cur * 2 :(cur + cur_len) * 2])

    cur_len = 8
    res = res + 'Domain ??? %d/%d\n' % (cur, cur_len)
    dom = item(m_[cur:cur+cur_len])
    res = res + dom['string']
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = 4
    res = res + 'Flags %d/%d\n' % (cur, cur_len)
    res = res + flags(m_[cur: cur + cur_len])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = 8
    res = res + 'NONCE %d/%d\n%s\n\n' % (cur, cur_len, m_hex[cur * 2 :(cur + cur_len) * 2])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = dom['offset'] - cur
    res = res + 'Unknown data %d/%d:\n' % (cur, cur_len)
    res = res + unknown_part(m_[cur: cur + cur_len])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = dom['len1']
    res = res + 'Domain ??? %d/%d:\n' % (cur, cur_len)
    res = res + 'Hex: %s\n' % m_hex[cur * 2: (cur + cur_len) * 2]
    res = res + 'String: %s\n\n' % ntlmutils.str2prn_str(m_[cur : cur + cur_len])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = len(m_) - cur
    res = res + 'Rest of the message %d/%d:\n' % (cur, cur_len)
    res = res + unknown_part(m_[cur: cur + cur_len])

    res = res + '\nEnd of message 2 report.\n'

    return res

#---------------------------------------------------------------------
def debug_message3(msg):
    ""
    m_ = base64.decodestring(msg)
    m_hex = ntlmutils.str2hex(m_)

    res = ''
    res = res + '==============================================================\n'
    res = res + 'NTLM Message 3 report:\n'
    res = res + '---------------------------------\n'
    res = res + 'Base64: %s\n' % msg
    res = res + 'String: %s\n' % ntlmutils.str2prn_str(m_)
    res = res + 'Hex: %s\n' % m_hex
    cur = 0

    res = res + '---------------------------------\n'
    cur_len = 12
    res = res + 'Header %d/%d:\n%s\n\n' % (cur, cur_len, m_hex[0:24])
    res = res + '%s\nmethod name 0/8\n%s               # C string\n\n' % (m_hex[0:16], ntlmutils.str2prn_str(m_[0:8]))
    res = res + '0x%s%s                 # message type\n' % (m_hex[18:20], m_hex[16:18])
    res = res + '%s                   # delimiter (zeros)\n' % m_hex[20:24]
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = 48
    res = res + 'Lengths and Positions %d/%d\n%s\n\n' % (cur, cur_len, m_hex[cur * 2 :(cur + cur_len) * 2])

    cur_len = 8
    res = res + 'LAN Manager response %d/%d\n' % (cur, cur_len)
    lmr = item(m_[cur:cur+cur_len])
    res = res + lmr['string']
    cur = cur + cur_len

    cur_len = 8
    res = res + 'NT response %d/%d\n' % (cur, cur_len)
    ntr = item(m_[cur:cur+cur_len])
    res = res + ntr['string']
    cur = cur + cur_len

    cur_len = 8
    res = res + 'Domain string %d/%d\n' % (cur, cur_len)
    dom = item(m_[cur:cur+cur_len])
    res = res + dom['string']
    cur = cur + cur_len

    cur_len = 8
    res = res + 'User string %d/%d\n' % (cur, cur_len)
    user = item(m_[cur:cur+cur_len])
    res = res + user['string']
    cur = cur + cur_len

    cur_len = 8
    res = res + 'Host string %d/%d\n' % (cur, cur_len)
    host = item(m_[cur:cur+cur_len])
    res = res + host['string']
    cur = cur + cur_len

    cur_len = 8
    res = res + 'Unknow item record %d/%d\n' % (cur, cur_len)
    unknown = item(m_[cur:cur+cur_len])
    res = res + unknown['string']
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = 4
    res = res + 'Flags %d/%d\n' % (cur, cur_len)
    res = res + flags(m_[cur: cur + cur_len])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = dom['len1'] + user['len1'] + host['len1']
    res = res + 'Domain, User, Host strings %d/%d\n%s\n%s\n\n' % (cur, cur_len, m_hex[cur * 2 :(cur + cur_len) * 2], ntlmutils.str2prn_str(m_[cur:cur + cur_len]))

    cur_len = dom['len1']
    res = res + '%s\n' % m_hex[cur * 2: (cur + cur_len) * 2]
    res = res + 'Domain name %d/%d:\n' % (cur, cur_len)
    res = res + '%s\n\n' % (ntlmutils.str2prn_str(m_[cur: (cur + cur_len)]))
    cur = cur + cur_len

    cur_len = user['len1']
    res = res + '%s\n' % m_hex[cur * 2: (cur + cur_len) * 2]
    res = res + 'User name %d/%d:\n' % (cur, cur_len)
    res = res + '%s\n\n' % (ntlmutils.str2prn_str(m_[cur: (cur + cur_len)]))
    cur = cur + cur_len

    cur_len = host['len1']
    res = res + '%s\n' % m_hex[cur * 2: (cur + cur_len) * 2]
    res = res + 'Host name %d/%d:\n' % (cur, cur_len)
    res = res + '%s\n\n' % (ntlmutils.str2prn_str(m_[cur: (cur + cur_len)]))
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = lmr['len1']
    res = res + 'LAN Manager response %d/%d\n%s\n\n' % (cur, cur_len, m_hex[cur * 2 :(cur + cur_len) * 2])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = ntr['len1']
    res = res + 'NT response %d/%d\n%s\n\n' % (cur, cur_len, m_hex[cur * 2 :(cur + cur_len) * 2])
    cur = cur + cur_len

    res = res + '---------------------------------\n'
    cur_len = len(m_) - cur
    res = res + 'Rest of the message %d/%d:\n' % (cur, cur_len)
    res = res + unknown_part(m_[cur: cur + cur_len])

    res = res + '\nEnd of message 3 report.\n'
    return res

