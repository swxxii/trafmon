package au.com.trafmon;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.db4o.ObjectContainer;

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
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		if (request.getParameter("lat") != null) {

			ObjectContainer db = Util.openDb();

			try {

				// Here we have a post request to store a point

				double lat = Double.parseDouble(request.getParameter("lat"));
				double lng = Double.parseDouble(request.getParameter("lng"));
				int bearing = Integer.parseInt(request.getParameter("bearing"));
				int speed = Integer.parseInt(request.getParameter("speed"));
				String tag = request.getParameter("tag");

				DataPoint newPoint = new DataPoint(lat, lng, bearing, speed, tag, new Date());

				DataPointSet pointSet = new DataPointSet(newPoint);

				db.store(newPoint);

				// Return the new point, why not!
				PrintWriter out = response.getWriter();

				out.println(pointSet.toJSON());

			} finally {
				db.close();
			}

		} else if (request.getParameter("maxLat") != null) {
			// Here we have a post request to return a number of points
			final Double maxLat = Double.parseDouble(request.getParameter("maxLat"));
			final Double maxLng = Double.parseDouble(request.getParameter("maxLng"));
			final Double minLat = Double.parseDouble(request.getParameter("minLat"));
			final Double minLng = Double.parseDouble(request.getParameter("minLng"));

			DataPointSet pointSet = null;

			//If we get in here, we are trying to get traffic for a specific day and time range
			if((request.getParameter("day") != null) && (Integer.parseInt(request.getParameter("day")) != 0) && (request.getParameter("timerange") != null)) {

				int startHour = 0;
				int endHour = 24;
				int timerange = Integer.parseInt(request.getParameter("timerange"));
				int day = Integer.parseInt(request.getParameter("day"));

				switch(timerange){
				
				case -1:
					startHour = 0;
					endHour = 24;

				case 0:
					startHour = 0;
					endHour = 6;
					break;

				case 1:
					startHour = 6;
					endHour = 9;
					break;

				case 2:
					startHour = 9;
					endHour = 16;
					break;

				case 3:
					startHour = 16;
					endHour = 19;
					break;

				case 4:
					startHour = 19;
					endHour = 24;
					break;
				}
				pointSet = DataPointService.getPointsByDayOfWeekAndTimeRange(maxLat, maxLng, minLat, minLng, day, startHour, endHour);
			}else{

				//If we are in here we are getting live traffic!

				Date date = new Date();

				pointSet = DataPointService.getPointsByDate(maxLat, maxLng, minLat, minLng, date);
			}

			PrintWriter out = response.getWriter();

			out.println(pointSet.toJSON());



		}
	}


}
