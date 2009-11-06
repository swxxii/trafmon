<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Data Generator</title>
</head>
<body>
Please select the data you want to generate:

<form name="input" method="post" action="DataGeneratorServlet">
	<input type="hidden" name="data" value="melbUni"/>
 	<input type="hidden" name="operation" value="create"/><br/>
	<input type="submit" value="Melb Uni Data" />
</form>

</body>
</html>