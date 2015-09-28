# Access control for NDN with Named Function Networking (NFN)

![Gatekeeper icon](gatekeeper.png)
Protecting the access to named data and named functions

This projects adds an access control system to NDN. It relies on an
existing "gatekeeper" implementation that sits between the client and
the requested target. "Target" in this case can be either
pre-published data or a data-on-demand service (= named function). The
gatekeeper generates and handouts a decryption key to authorized
clients.

With this project we explore
- how easy it is to publish a function accessible to NDN clients
- how easy (for the client) it is to submit to the producer-imposed access control, also via NDN
- how easy it is to write custom access controllers inside the gatekeeper

See the slide deck used to advertize this project ([Powerpoint](doc/access-ctrl-w-NFN.pptx)).


## First phase (Saturday): Access control for an echo() service

Goal: To let an app written for NDN-js (client) request a decryption
key for a specific named service, in this case a simple echo, and then
invoke that service. Access control will be based on the identity of
the client.

Achievement of Saturday: Everybody is on the same page, agreement on
implementation plan and division of labor. Summary of the design:

We align with Marxer's schema and the three "channels" needed for
access control: a) permission granting channel, b) key provisioning channel,
c) content channel. However, we simplify the "security dance" and combine
a+b) permission and key channel.

In a first phase, the permission granting and key generating entity
(gatekeeper) is co-located with the content producing entity. This
permits to share the generated content encryption keys via the local
file system.

System Architecture:

![System architecture](sys-arch.png)

Mangled name format for requesting permission and retrieving the decryption key:

~~~
I: /service-provider-prefix/echo/p/<keyname>/NFN
D: /service-provider-prefix/echo/p/<keyname>/NFN
   payload = base64(asymencr(pubkey_keyname, encryptionKey))
~~~

Mangled name format for requesting service invocation:

~~~
I: /service-provider-prefix/echo/c/<keyname, msg>/NFN
D: /service-provider-prefix/echo/c/<keyname, msg>/NFN
   payload = symencr(encryptionKey, msg))
~~~

Discussion:

Shouldn't the "p" and "c" component come before the service name? Like in

~~~
I: /service-provider-prefix/c/echo/<params>/NFN
  or
I: /service-provider-prefix/c/lambda/<expr>/NFN
  or
I: /service-provider-prefix/c/datalog/<expr>/NFN
  etc
~~~


## Second phase (Sunday)

Revision of the name mangling: In order to avoid introducing a
name-rewriting engine, it was decided to expose for the time being the
NFN-specific way of calling the named function:

~~~
I: /service-provider-prefix/call 2 echo_p <keyname>/NFN
  and
I: /service-provider-prefix/call 2 echo_c <keyname> <msg>/NFN
~~~

What works:
- serving permission+key requests, including access right lookup but without asym enryption of the returned key
- serving echo() requests, using the generated key
- splitting the gatekeeper work in a access controler and a content controler

What does not work yet:
- the web client
- the GitHub pages

Difficulties encountered:
- Web-based NDN application cannot directly send UDP datagrams (towards ccn-lite), hence use web sockets, hence interpose an NFD relay. Now NFD in Ubuntu packages produces core dumps, so compile form sources.
- The new chat app is too complex to take as a starting point. Instead, use test0get-asynch.html
- No support for symmetric encryption in ndn.js (for decrypting results)

## Future work

Candidate targets:

-  implement a content-dependend access rule e.g., threshold (which cannot be expressed at the name level)
-  store data-decryption keys in the NDN memory fabric. This has the benefit that content access is possible even if the gatekeeper crashes and cannot remember the assigned data decryption keys.


## Demos

Candidate targets:

- demonstrate access-controlled execution of lambda expression reduction
- demonstrate chaining of access-controlled data filtering
- demonstrate mapping of access control to database query rights


## Lessons learned

- use the Gatekeeper protocol to secure access to NFN

----

