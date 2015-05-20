# Basic REST.
# Most REST APIs will set semantic values in response.body and response.code.
require "net/https"
require "uri"

uri = URI.parse("https://auth.test.example.com")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new("/v2.0/users")
request.add_field 'Content-type', 'application/json'
request.add_field 'X-Auth-Token', '85728abe-5555-5555-5555-219738c6e49c'
post_body = []
post_body << '{"user": { "username":"eddie", "email": "eddie@example.com", "enabled": true} }'
request.body = post_body.join
response = http.request(request)

puts response.code + " " + response.msg
response.header.each_header {|key,value| puts "#{key} = #{value}" }
puts ""
puts response.body
puts ""

