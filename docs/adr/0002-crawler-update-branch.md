# Crawler update branch ownership

The concert crawler owns its update branch exclusively and may replace its contents with a newly generated update based on main. Human changes belong on another branch. The workflow must verify the remote branch has not changed since it observed it before replacing it, so a concurrent update is not silently overwritten.
