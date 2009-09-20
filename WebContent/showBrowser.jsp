<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Strict//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Show Browser</title>
</head>
<body>
<table border="1">
	<tr>
		<th>Header</th>
		<th>Value</th>
	</tr>
	<tr>
		<td>user-agent</td>
		<td><%=request.getAttribute("client.browser")%></td>
	</tr>
</table>
</body>
</html>