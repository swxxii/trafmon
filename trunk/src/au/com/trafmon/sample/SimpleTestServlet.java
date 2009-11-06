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
 * Servlet implementation class DataGenerator
 */
public class SimpleTestServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SimpleTestServlet() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//request.setAttribute("TestAttr", "AttrVal");
		request.getRequestDispatcher("/WEB-INF/dataPoints.jsp").forward(
				request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//request.setAttribute("TestAttr", "AttrVal");
		request.getRequestDispatcher("/WEB-INF/dataPoints.jsp").forward(
				request, response);
    }
}