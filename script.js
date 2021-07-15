var homeButton = document.getElementById("homeButton");
var elements = document.getElementsByClassName("HeaderButton");
var windowWidth = window.innerWidth;
var images = document.getElementsByClassName("image");
var height = document.height;

UpdateImages();

function ChangePage(pageString)
{
    document.location = pageString;
}

window.onresize = function(event){

}


document.addEventListener('scroll', function(e) {
    UpdateImages();
});

function UpdateImages()
{
    for (var i=0; i<images.length; i++)
    {
        var rect = images[i].getBoundingClientRect();
        if ((rect.top+rect.bottom)/2 > 0 && (rect.top+rect.bottom)/2 < window.innerHeight)
        {
            images[i].setAttribute("style","opacity:1");
        } else {
            images[i].setAttribute("style","opacity:0");
        }
    }
}

var parallax = document.querySelectorAll(".parallax");
var	speed = -0.25;

window.onscroll = function() {
	[].slice.call(parallax).forEach(function(el, i) {
		var windowYOffset = window.pageYOffset, elBackgrounPos = "50% " + (windowYOffset * speed + i * 200) + "px";
		el.style.backgroundPosition = elBackgrounPos;
	});
};




