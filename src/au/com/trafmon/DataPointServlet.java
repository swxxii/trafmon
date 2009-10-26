package au.com.trafmon;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.SimpleTimeZone;
import java.util.TimeZone;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

/**
 * Servlet implementation class DataPointServlet
 */
public class DataPointServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public DataPointServlet() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// Get is for things that dont change the state of the db, so get points
		// here
		/*
		 * For the moment, I am going to write this so that it expects the
		 * parameters: maxLat, maxLng, minLat, minLng (all doubles) time (long)
		 */

		final Double maxLat = Double.parseDouble(request.getParameter("maxLat"));
		final Double maxLng = Double.parseDouble(request.getParameter("maxLng"));
		final Double minLat = Double.parseDouble(request.getParameter("minLat"));
		final Double minLng = Double.parseDouble(request.getParameter("minLng"));

		// Here i am creating a date from the current time in milliseconds since January 1, 1970, 00:00:00 GMT
		// I dont claim that this is the best format, and it could well change it the future
		// (its easy to make it parse a string for example)
		Date date = new Date(Long.parseLong(request.getParameter("date")));

		DataPointSet pointsSet = DataPointService.getPointsByDayOfWeek(maxLat, maxLng, minLat, minLng, date);

		request.setAttribute("points", pointsSet);

		request.getRequestDispatcher("/WEB-INF/showData.jsp").forward(request, response);

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// Post is for things that change the state of the db, so upload points
		// here
	}

}
