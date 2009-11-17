package au.com.trafmon.sample;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

import au.com.trafmon.DataPoint;
import au.com.trafmon.DataPointSet;
import au.com.trafmon.Util;

/**
 * Servlet implementation class SimpleTestServlet
 * This servlet was another servlet to test my use of db4o
 * @author schester
 */
public class SimpleTestServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	ObjectContainer db;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SimpleTestServlet() {
		super();
		db = Util.openDb();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//request.setAttribute("TestAttr", "AttrVal");
		//request.getRequestDispatcher("/WEB-INF/dataPoints.jsp").forward(
		//		request, response);
		
//		response.setContentType("text/html");
//		PrintWriter writer = response.getWriter();
//		writer.println("<html>");
//		writer.println("<head><title>Hello World Servlet</title></head>");
//		writer.println("<body>Hello World! How are you doing?</body>");
//		writer.println("</html>");
//		writer.close();		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//request.setAttribute("TestAttr", "AttrVal");
		//request.getRequestDispatcher("/WEB-INF/dataPoints.jsp").forward(
		//		request, response);
		String point = (String)request.getParameter("point");
//		db.store(new DataPoint(point, 0));

//		List<DataPoint> list = db.query(new Predicate<DataPoint>() {
//			public boolean match(Pilot candidate) {
//				return true;
//			}
//		});
		
		
		
//		response.setContentType("text/html");
//		PrintWriter writer = response.getWriter();
//		writer.println("<html>");
//		writer.println("<head><title>Hello World Servlet</title></head>");
//		writer.println("<body>Hello World! How are you doing?</body>");
//		writer.println("</html>");
//		writer.close();		
				
    }
}