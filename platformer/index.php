<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Platformer - Håvard Stien, Steffen Evensen</title>
	<!-- Libraries -->
	<script
		src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
	<script src="./lib/three.min.js"></script>
	<script src="./lib/physi.js"></script>
	<script src="./lib/tween.js"></script>
	<script src="./lib/OrbitControls.js"></script>
	
	<!-- Scripts -->
	<script src="./js/platformer.boot.js"></script>
	<script src="./js/platformer.core.js"></script>
</head>
<body>
	<div id="viewport"></div>
	<script type="text/javascript">
		$(document).ready(function() {
			Platformer.Init();
		});
	</script>
</body>


</html>