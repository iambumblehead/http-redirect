// Filename: http-redirect.js  
// Timestamp: 2013.08.07-20:22:13 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// 
// https demonstration from nodejs.org
// http://nodejs.org/docs/latest/api/https.html#https_https_get_options_callback


var http = require('http'),
    https = require('https'),
    formurlencoded = require('form-urlencoded');

var HTTPRedirect = module.exports = (function () {

  var contentTypeJSON = 'application/json',
      contentTypeFORM = 'application/x-www-form-urlencoded';

  var proxyObj = {
    localIP : '127.0.0.1',
    host : 'www.google.com',
    port : 80,

    // should be redefined at constructor
    getAsEncodedFormStr : function (obj) { 
      return 'getAsFORMStr'; 
    },

    getAsJSONStr : function (obj) { 
      return 'getAsJSONStr';
    },
    
    isReqEncrypted : function (req) {
      var isEncrypted = false;
      if (typeof req === 'object') {
        if (req.connection.encrypted) {
          isEncrypted = true;
        }
      }
      return isEncrypted;
    },

    getReqProxyHeaders : function (req, body) {
      var that = this, headers = req.headers, finHeaders = {},
          reqProtocol = that.isReqEncrypted(req) ? 'https' : 'http';

      for (var o in headers) {
        if (headers.hasOwnProperty(o)) {
          finHeaders[o] = headers[o];
        }
      }

      if ('accept-encoding' in finHeaders) {
        delete finHeaders['accept-encoding'];
      }

      finHeaders['host'] = that.host;
      finHeaders['x-forwarded-for'] = that.localIP;
      finHeaders['x-forwarded-proto'] = reqProtocol;     

      if (typeof body === 'string') {
        finHeaders['content-length'] = body.length;      
      }

      return finHeaders;
    },

    getReqProxyBody : function (req) {
      var that = this, contentType = req.headers['content-type'], 
          finBody = null;

      if (contentType === contentTypeFORM) {
        finBody = that.getAsEncodedFormStr(req.body);        
      } else if (contentType === contentTypeJSON) {
        finBody = that.getAsJSONStr(req.body);        
      }

      return finBody;
    },

    doProxy : function (req, res) {
      var that = this, newReq, body, chunksCat = '',
          isEncrypted = that.isReqEncrypted(req),
          newRequestType = isEncrypted ? https : http;

      var options = {
        method : req.method,
        host : that.host,
        port : that.port,
        path : req.url
      };

      body = that.getReqProxyBody(req);
      options.headers = that.getReqProxyHeaders(req, body);

      if (isEncrypted) {
        options.agent = new https.Agent(options);
      }

      // newRequest as an 'http' or 'https' object
      newReq = newRequestType.request(options, function(newRes) {
        newRes.setEncoding('utf8');

        newRes.on('error', function(e) { 
          console.log('[!!!] '+ e.message, options.port, options.host, options.path, body);
          res.writeHead(500);
          res.end();
        });

        newRes.on('data', function(chunk) {
          chunksCat += chunk;
        });

        newRes.on('end', function () {
          res.write(chunksCat);
          res.end();
        });
        
        newRes.on('close', function() {
          res.writeHead(newRes.statusCode);
          res.end();
        });
      });

      if (body) newReq.write(body);

      newReq.on('error', function(e) {
        console.log('[!!!] '+ e.message, options.port, options.host, options.path);
        res.writeHead(500);
        res.end();
      });

      newReq.end();
    }
    
  };

  return {
    getProxyObj : function (spec) {
      var that = Object.create(proxyObj);

      that.localIP = spec.localIP;
      that.host = spec.host;
      that.port = spec.port;

      that.getAsEncodedFormStr = formurlencoded.encode;

      that.getAsJSONStr = function (o) {
        try {
          return JSON.stringify(o);
        } catch (e) { console.log('[!!!] HTTPRedirect: invalid json.'); }
      };

      return that;
    }, 

    addExpressProxy : function (expressApp, ipAddress, port, uri) {
     var proxyObj = HTTPRedirect.getProxyObj({
         localIP : '127.0.0.1',
         host : ipAddress, 
         port : port
     });   

     expressApp.all(uri || '/', function (req, res) {
       proxyObj.doProxy(req, res);
     });
    }
  };

}());
