package au.com.trafmon;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

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

		} else if (request.getParameter("maxlat") != null) {
			// Here we have a post request to return a number of points
			final Double maxLat = Double.parseDouble(request.getParameter("maxLat"));
			final Double maxLng = Double.parseDouble(request.getParameter("maxLng"));
			final Double minLat = Double.parseDouble(request.getParameter("minLat"));
			final Double minLng = Double.parseDouble(request.getParameter("minLng"));

			// Here i am creating a date from the current time in
			// milliseconds since January 1, 1970, 00:00:00 GMT
			// I dont claim that this is the best format, and it
			// could well change it in the future
			// (its easy to make it parse a string for example)
			Date date = new Date(Long.parseLong(request.getParameter("date")));

			// As you can see by the method used, this will return all points
			// that occur on the given day of the week (Monday, tuesday ect)
			// during the given hour
			DataPointSet pointSet = DataPointService.getPointsByDayOfWeek(maxLat, maxLng, minLat, minLng, date);

			PrintWriter out = response.getWriter();

			out.println(pointSet.toJSON());
		}
	}

}
