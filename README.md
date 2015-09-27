# Access control for NDN with NFN

This projects adds an access control system to NDN that permits to
hand out individual decryption keys to clients.


== First phase (Saturday): Access control for echo()

Goal: To let an app written in NDN-js (client) request a decryption
key for a specific named service, in this case a simple echo, and then
invoke that service.

We align with Marxer's schema and the three "channels" needed for
access control: permission granting channel, key provisioning channel,
content channel. However, we simplify the "security dance" and combine
permission and key channel.

In a first phase, the permission granting and key creating entity
(gatekeeper) also runs the content generating activity.


Format for requesting permission and retrieving the decryption key:

~~~
I: /service-provider-prefix/echo/p/<keyname>/NFN
D: /service-provider-prefix/echo/p/<keyname>/NFN
   payload = base64(asymencr(pubkey_keyname, encryptionKey))
~~~

Format for request service invocation:

~~~
I: /service-provider-prefix/echo/c/<keyname, msg>/NFN
D: /service-provider-prefix/echo/c/<keyname, msg>/NFN
   payload = symencr(encryptionKey, msg))
~~~

Discussion:

shouldn't the "p" and "c" component come before the service name? Like in

~~~
I: /service-provider-prefix/c/echo/<params>/NFN
  or
I: /service-provider-prefix/c/lambda/<expr>/NFN
  or
I: /service-provider-prefix/c/datalog/<expr>/NFN
  etc
~~~

== Second phase


> eof
