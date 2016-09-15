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

import string, urlparse

http_debug_file_name = 'http.debug'

#-----------------------------------------------------------------------
# tests client's header for correctness
def test_client_http_header(header_str):
    ""
    request = string.split(header_str, '\012')[0]
    parts = string.split(request)

    # we have to have at least 3 words in the request
    # poor check
    if len(parts) < 3:
        return 0
    else:
        return 1


#-----------------------------------------------------------------------
# tests server's response header for correctness
def test_server_http_header(header_str):
    ""
    response = string.split(header_str, '\012')[0]
    parts = string.split(response)
    
    # we have to have at least 2 words in the response
    # poor check
    if len(parts) < 2:
        return 0
    else:
        return 1

#-----------------------------------------------------------------------
def extract_http_header_str(buffer):
    ""
    # let's remove possible leading newlines
    t = string.lstrip(buffer)

    # searching for the RFC header's end
    delimiter = '\015\012\015\012'
    header_end = string.find(t, delimiter)

    if header_end < 0:
        # may be it is defective header made by junkbuster
        delimiter = '\012\012'
        header_end = string.find(t, delimiter)

    if header_end >=0:
        # we have found it, possibly
        ld = len(delimiter)
        header_str = t[0:header_end + ld]

        # Let's check if it is a proper header
        if test_server_http_header(header_str) or test_client_http_header(header_str):
            # if yes then let's do our work
            if (header_end + ld) >= len(t):
                rest_str = ''
            else:
                rest_str = t[header_end + ld:]
        else:
            # if not then let's leave the buffer as it is
            # NOTE: if there is some junk before right header we will never
            # find that header. Till timeout, I think. Not that good solution.
            header_str = ''
            rest_str = buffer

    else:
        # there is no complete header in the buffer
        header_str = ''
        rest_str = buffer

    return (header_str, rest_str)

#-----------------------------------------------------------------------
def extract_server_header(buffer):
    ""
    header_str, rest_str = extract_http_header_str(buffer)
    if header_str:
        header_obj = HTTP_SERVER_HEAD(header_str)
    else:
        header_obj = None

    return (header_obj, rest_str)

#-----------------------------------------------------------------------
def extract_client_header(buffer):
    ""
    header_str, rest_str = extract_http_header_str(buffer)
    if header_str:
        header_obj = HTTP_CLIENT_HEAD(header_str)
    else:
        header_obj = None

    return (header_obj, rest_str)

#-----------------------------------------------------------------------
def capitalize_value_name(str):
    ""
    tl = string.split(str, '-')
    for i in range(len(tl)):
        tl[i] = string.capitalize(tl[i])

    return string.join(tl, '-')


#-----------------------------------------------------------------------
# some helper classes
#-----------------------------------------------------------------------
class HTTP_HEAD:
    ""
    pass

    #-------------------------------
    def __init__(self, head_str):
        ""
        self.head_source = ''
        self.params = None
        self.fields = None
        self.order_list = []

        self.head_source = head_str
        head_str = string.strip(head_str)
        records = string.split(head_str, '\012')

        # Dealing with response line
        #fields = string.split(records[0], ' ', 2)
        t = string.split(string.strip(records[0]))
        fields = t[:2] + [string.join(t[2:])]

        self.fields = []
        for i in fields:
            self.fields.append(string.strip(i))

        # Dealing with params
        params = {}
        order_list = []
        for i in records[1:]:
            parts = string.split(string.strip(i), ':', 1)
            pname = string.lower(string.strip(parts[0]))
            if not params.has_key(pname):
                params[pname] = []
                order_list.append(string.lower(pname))
            try:
                params[pname].append(string.strip(parts[1]))
            except:
                msg = "ERROR: Exception in head parsing. ValueName: '%s'" % pname
                #print msg
                self.debug(msg)

        self.params = params
        self.order_list = order_list


    #-------------------------------
    def debug(self, message):
        ""
        f = open(http_debug_file_name ,'a')
        f.write(message)
        f.write('\n=====\n')
        f.write(self.head_source)
        f.close()

    #-------------------------------
    def copy(self):
        ""
        import copy
        return copy.deepcopy(self)


    #-------------------------------
    def get_param_values(self, param_name):
        ""
        param_name = string.lower(param_name)
        if self.params.has_key(param_name):
            return self.params[param_name]
        else:
            return []

    #-------------------------------
    def del_param(self, param_name):
        ""
        param_name = string.lower(param_name)
        if self.params.has_key(param_name): del self.params[param_name]

    #-------------------------------
    def has_param(self, param_name):
        ""
        param_name = string.lower(param_name)
        return self.params.has_key(param_name)

    #-------------------------------
    def add_param_value(self, param_name, value):
        ""
        param_name = string.lower(param_name)
        if not self.params.has_key(param_name):
            self.params[param_name] = []
        if param_name not in self.order_list:
            self.order_list.append(param_name)
        self.params[param_name].append(value)

    #-------------------------------
    def replace_param_value(self, param_name, value):
        ""
        self.del_param(param_name)
        self.add_param_value(param_name, value)

    #-------------------------------
    def __repr__(self, delimiter='\n'):
        ""
        res = ''
        cookies = ''
        res = string.join(self.fields, ' ') + '\n'

        for i in self.order_list:
            if self.params.has_key(i):
                if i == 'cookie':
                    for k in self.params[i]:
                        cookies = cookies + capitalize_value_name(i) + ': ' + k + '\n'
                else:
                    for k in self.params[i]:
                        res = res + capitalize_value_name(i) + ': ' + k + '\n'
        res = res + cookies
        res = res + '\n'

        return res

    #-------------------------------
    def send(self, socket):
        ""
        #"""
        res = ''
        cookies = ''
        res = string.join(self.fields, ' ') + '\015\012'

        for i in self.order_list:
            if self.params.has_key(i):
                if i == 'cookie':
                    for k in self.params[i]:
                        cookies = cookies + capitalize_value_name(i) + ': ' + k + '\015\012'
                else:
                    for k in self.params[i]:
                        res = res + capitalize_value_name(i) + ': ' + k + '\015\012'
        res = res + cookies
        res = res + '\015\012'
        #"""
        #res = self.__repr__('\015\012')
        # NOTE!!! 0.9.1 worked, 0.9.5 and 0.9.7 did not with MSN Messenger.
        # We had problem here that prevent MSN Messenger from working.
        # Some work is needed to make __rerp__ working instead of current code..
        try:
            #socket.send(self.head_source)
            socket.send(res)
            # self.debug(res)
            return 1
        except:
            return 0

#-----------------------------------------------------------------------
class HTTP_SERVER_HEAD(HTTP_HEAD):

    #-------------------------------
    def get_http_version(self):
        ""
        return self.fields[0]

    #-------------------------------
    def get_http_code(self):
        ""
        return self.fields[1]

    #-------------------------------
    def get_http_message(self):
        ""
        return self.fields[2]

#-----------------------------------------------------------------------
class HTTP_CLIENT_HEAD(HTTP_HEAD):

    #-------------------------------
    def get_http_version(self):
        ""
        return self.fields[2]

    #-------------------------------
    def get_http_method(self):
        ""
        return self.fields[0]

    #-------------------------------
    def get_http_url(self):
        ""
        return self.fields[1]

    #-------------------------------
    def set_http_url(self, new_url):
        ""
        self.fields[1] = new_url

    #-------------------------------
    # There is some problem with www request header...
    # not all servers want to answer to requests with full url in request
    # but want have net location in 'Host' value and path in url.
    def make_right_header(self):
        ""
        url_tuple = urlparse.urlparse(self.get_http_url())
        net_location = url_tuple[1]
        self.replace_param_value('Host', net_location)

        path = urlparse.urlunparse(tuple(['', ''] + list(url_tuple[2:])))
        self.set_http_url(path)

    #-------------------------------
    def get_http_server(self):
        ""
        # trying to get host from url
        url_tuple = urlparse.urlparse(self.get_http_url())
        net_location = url_tuple[1]

        # if there was no host in url then get it from 'Host' value
        if not net_location:
            net_location = self.get_param_values('Host')[0]

        if not net_location:
            net_location = 'localhost'

        # trying to parse user:passwd@www.some.domain:8080
        # is it needed?
        if '@' in net_location:
            cred, net_location = string.split(net_location, '@')
        if ':' in net_location:
            server, port = string.split(net_location, ':')
            port = int(port)
        else:
            server = net_location
            port = 80

        return server, port

