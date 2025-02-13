Just some temporary notes while doing fast iterations


599 errors are just until I actually figure out which code to use where, it's a code that is pretty much not used, so seeing it means it's very probably the server doing something wrong

for other servers, we need:
- a way to create a user account as a visitor (meaning they only want to fetch pings). No need for a signup key for this since we don't need to prevent spam as a visitor can only fetch pings and already needs to be "reffered" by another user, meaning that the other user on that server must say to the server that it's ok that the visitor creates an account.
so basically the create account for a visitor will be when people adds themselves as friends from different servers. If they are already a visitor of the other's server, no need to create an account, just link the two users.
- a way to fetch pings as a visitor
- a way to send, accept friend requests and create links between visitor and user (never between two visitors)
