<%@ page
	import="java.util.List,au.com.trafmon.DataPoint,au.com.trafmon.DataPointSet"
	language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Show all data</title>
</head>
<body>

<%
	DataPointSet points = null;
	if ((points = (DataPointSet) request.getAttribute("points")) != null) {
		if (points.getDataPoints() != null) {
%>
<table border="1">
	<tr>
		<th>Lat</th>
		<th>Lng</th>
		<th>Speed</th>
		<th>Date</th>
	</tr>
	<%
		List<DataPoint> pointL = points.getDataPoints();

				for (DataPoint point : pointL) {
					out.println("<tr>");
					out.println("<td>" + point.getLat() + "</td>");
					out.println("<td>" + point.getLng() + "</td>");
					out.println("<td>" + point.getSpeed() + "</td>");
					out.println("<td>" + point.getDate() + "</td>");
					out.println("</tr>");
				}
			} else {
				out.println("There is currently no data in the database");
			}
		} else {
			out.println("There is currently no data in the database");
		}
	%>
</table>

</body>
</html>