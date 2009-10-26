package au.com.trafmon;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

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
		// Get is for things that dont change the state of the db, so get points here
		/* 
		 * For the moment, I am going to write this so that it expects the parameters:
		 * maxLat, maxLng, minLat, minLng (all doubles)
		 * time (a java.util.Date) (n.b. not sure how this one will work in the end)
		 */

		final Double maxLat = Double.parseDouble(request.getParameter("maxLat"));
		final Double maxLng = Double.parseDouble(request.getParameter("maxLng"));
		final Double minLat = Double.parseDouble(request.getParameter("minLat"));
		final Double minLng = Double.parseDouble(request.getParameter("minLng"));
		
		//Here i am creating a date from the current time in milliseconds since January 1, 1970, 00:00:00 GMT
		//I dont claim that this is the best format, and it could well change it the future 
		// (its easy to make it parse a string for example)
		//Also, its not to hard to extend this to handle the ability to get all data on specific days of the week (look up java.util.Calendar)
		Date date = new Date(Long.parseLong(request.getParameter("date")));
		
		GregorianCalendar calendar = new GregorianCalendar();
		
		calendar.setTime(date);

		
		
		ObjectContainer db = Util.openDb();
		try {
			List<DataPoint> dataPoints = db.query(new Predicate<DataPoint>() {
				public boolean match(DataPoint candidate) {
					if(candidate.getLat() <= maxLat
					&& candidate.getLat() >= minLat
					&& candidate.getLng() <= maxLng
					&& candidate.getLng() >= minLng){

						return true;
					}else{
						return false;
					}
				}
			});

			DataPointSet pointsSet = new DataPointSet();

			pointsSet.setDataPoints(dataPoints);

			request.setAttribute("points", pointsSet);

			request.getRequestDispatcher("/WEB-INF/showData.jsp").forward(request, response);
		} finally {
			db.close();
		}
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
