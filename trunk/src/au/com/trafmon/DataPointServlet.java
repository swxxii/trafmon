package au.com.trafmon;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.Enumeration;
import java.util.GregorianCalendar;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import au.com.trafmon.DataPoint.Layer;

import com.db4o.Db4o;
import com.db4o.ObjectContainer;

/**
 * Servlet implementation class DataPointServlet
 * 
 * This servlet is the central one in the trafmon system. It handles all incoming requests that deal with DataPoints.
 * These fall into two categories; requests for a set of points, and a request to store a point.
 * Both are POST requests.
 * 
 * @author schester
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
		
		//Need to set up db4o to handle java calendars properly.
		Db4o.configure().objectClass(GregorianCalendar.class).callConstructor(true);



		if (request.getParameter("lat") != null) {
			// Here we have a post request to store a point
			ObjectContainer db = Util.openDb();

			try {

				//Set up the variables
				double lat = Double.parseDouble(request.getParameter("lat"));
				double lng = Double.parseDouble(request.getParameter("lng"));
				int bearing = Integer.parseInt(request.getParameter("bearing"));
				int speed = Integer.parseInt(request.getParameter("speed"));
				String tag = request.getParameter("tag");
				Layer layer = ( Integer.parseInt(request.getParameter("layer")) == 1 ) ? Layer.CAR : Layer.PUBLIC ;

				//Make the data point
				DataPoint newPoint = new DataPoint(lat, lng, bearing, speed, tag, new Date(), layer);

				//Store the data point
				db.store(newPoint);
				
				// Return the new point, so the client can verify it if they wish.
				DataPointSet pointSet = new DataPointSet(newPoint);			
				PrintWriter out = response.getWriter();
				out.println(pointSet.toJSON());

			} finally {
				db.close();
			}

		} else if (request.getParameter("maxLat") != null) {
			// Here we have a post request to return a number of points
			
			//Get the veriables that MUST be present
			final Double maxLat = Double.parseDouble(request.getParameter("maxLat"));
			final Double maxLng = Double.parseDouble(request.getParameter("maxLng"));
			final Double minLat = Double.parseDouble(request.getParameter("minLat"));
			final Double minLng = Double.parseDouble(request.getParameter("minLng"));
			final Layer layer = ( Integer.parseInt(request.getParameter("layer")) == 1 ) ? Layer.CAR : Layer.PUBLIC ;

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
				pointSet = DataPointService.getPointsByDayOfWeekAndTimeRange(maxLat, maxLng, minLat, minLng, day, startHour, endHour, layer);
			}else{

				//If we are in here we are getting live traffic!

				Date date = new Date();

				pointSet = DataPointService.getPointsByDate(maxLat, maxLng, minLat, minLng, date, layer);
			}

			//Return the JSON of the points
			PrintWriter out = response.getWriter();

			out.println(pointSet.toJSON());



		}
	}


}
