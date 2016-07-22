$(window).load(function () {

var size = 1;
var button = 1;
var button_class = "gallery-header-center-right-links-current";
var normal_size_class = "gallery-content-center-normal";
var full_size_class = "gallery-content-center-full";
var $container = $('#gallery-content-center');

$container.isotope({itemSelector : 'img'});


function check_button(){
	$('.gallery-header-center-right-links').removeClass(button_class);
	if(button==1){
		$("#filter-1").addClass(button_class);
		$("#gallery-header-center-left-title").html($("#filter-1").attr("alt"));
		}
	if(button==2){
		$("#filter-2").addClass(button_class);
		$("#gallery-header-center-left-title").html($("#filter-2").attr("alt"));
		}
	if(button==3){
		$("#filter-3").addClass(button_class);
		$("#gallery-header-center-left-title").html($("#filter-3").attr("alt"));
		}
	if(button==4){
		$("#filter-4").addClass(button_class);
		$("#gallery-header-center-left-title").html($("#filter-4").attr("alt"));
		}
}

function check_size(){
	$("#gallery-content-center").removeClass(normal_size_class).removeClass(full_size_class);
	if(size==0){
		$("#gallery-content-center").addClass(normal_size_class);
		$("#gallery-header-center-left-icon").html('<span class="iconb" data-icon="&#xe23a;"></span>');
		}
	if(size==1){
		$("#gallery-content-center").addClass(full_size_class);
		$("#gallery-header-center-left-icon").html('<span class="iconb" data-icon="&#xe23b;"></span>');
		}
	$container.isotope({itemSelector : 'img'});
}



$("#filter-1").click(function() { $container.isotope({ filter: '.1' }); button = 1; check_button(); });
$("#filter-2").click(function() {  $container.isotope({ filter: '.2' }); button = 2; check_button();  });
$("#filter-3").click(function() {  $container.isotope({ filter: '.3' }); button = 3; check_button();  });
$("#filter-4").click(function() {  $container.isotope({ filter: '.4' }); button = 4; check_button();  });
$("#gallery-header-center-left-icon").click(function() { if(size==0){size=1;}else if(size==1){size=0;} check_size(); });

// Show first page only
$container.isotope({ filter: '.1' }); button = 1; check_button();


check_button();
check_size();
});