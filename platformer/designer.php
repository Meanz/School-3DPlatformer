<?php

	
	$op = $_GET['op'];

	if($op == "savelevel")
	{
		$levelName = $_GET['levelName'];
		$data = $_POST['data'];
		$file = "./levels/" . $levelName . ".json";
		file_put_contents($file, $data);
		echo "ok";
	}
	 else{
	 	echo "not ok";
	 }

?>