/* scanner_factory.py — seule caméra navigateur retenue */
(function(g){function create_scanner(hw='web',kwargs={}){if(!['web','camera'].includes(hw))throw new Error(`Scanner non implémenté: ${hw}`);return new g.BrowserQrScanner(kwargs)}g.create_scanner=create_scanner})(globalThis);
