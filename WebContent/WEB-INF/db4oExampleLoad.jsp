<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>



<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>db4o example page</title>
</head>
<body>

<script type="text/javascript">
var pilots = <%=request.getAttribute("pilots")%>
</script>

<table>
<c:forEach var="pilot"
	items="${pilots}">
	<tr>
	<td><c:out value="${pilot.name}"/></td>
	</tr>
</c:forEach>
</table>

</body>
</html>