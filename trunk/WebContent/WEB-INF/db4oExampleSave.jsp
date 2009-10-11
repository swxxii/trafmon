<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>db4o example page</title>
</head>
<body>

<form name="input" method="post" action="Db4oServlet">
Name: <input type="text" name="name" /><br/>
<input type="submit" value="Save Pilot"/></form>

<form name="done" method="get" action="Db4oServlet">
<input type="hidden" name="to" value="load"/><br/>
<input type="submit" value="Load Pilots"/>
</form>
</body>
</html>