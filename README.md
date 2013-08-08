http-redirect
=============
**(c)[Bumblehead][0], 2012,2013** [MIT-license](#license)  

### OVERVIEW:

proxy or redirect requests to an ip-address or url

[0]: http://www.bumblehead.com                            "bumblehead"

---------------------------------------------------------
#### <a id="install"></a>INSTALL:

objobjwalk may be downloaded directly or installed through `npm`.

 * **npm**   

 ```bash
 $ npm install http-redirect
 ```

 * **Direct Download**
 
 ```bash  
 $ git clone https://github.com/iambumblehead/http-redirect.git
 $ cd objobjwalk && npm install
 ```
---------------------------------------------------------
#### <a id="get-started">GET STARTED: 

 Use http-redirect with express. Request a page on localhost:12345.
 
 ```javascript
 var express = require('express'),
     HTTPRedirect = require('http-redirect'),
     app = express();
 
 HTTPRedirect.addExpressProxy(app, 'www.cryptogon.com', 80);
 app.listen(12345);
 
 console.log('begin proxy';)
 ```
