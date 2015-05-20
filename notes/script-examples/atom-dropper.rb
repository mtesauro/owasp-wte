# Quick and dirty way to send lots of whitespace to Atom Hopper staging
require "net/https"
require "uri"

uri = URI.parse("https://atom.staging.example.com")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new("/demo/events")
request.add_field 'Content-type', 'application/atom+xml'
# Make sure a fresh auth token is below
request.add_field 'X-Auth-Token', 'b767500f-5555-5555-5555-dafeddd9fef0'
post_body = []
post_body << '<entry xmlns="http://www.w3.org/2005/Atom">  <title type="text">Product Security test</title>'
post_body << " " * 33554432
post_body << '<author>    <name>Bob Trout</name>  </author>  <content type="text">Trout Fishing is cool!</content>  <category term="demo" /></entry>'
request.body = post_body.join
response = http.request(request)

puts response.code + " " + response.msg
response.header.each_header {|key,value| puts "#{key} = #{value}" }
puts ""
puts response.body
puts ""


