module.exports = function(app)
{
     app.get('/',function(req,res){
        var size = 0;
        var count = -1;
        res.render('index.html', {
            size: ++ count +'. size received: ' + size
        })
     });
     app.get('/about',function(req,res){
        res.render('about.html');
    });
}