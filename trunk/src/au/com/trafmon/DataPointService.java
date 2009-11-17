package au.com.trafmon;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.TimeZone;

import au.com.trafmon.DataPoint.Layer;

import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

/**
 * 
 * This class is the db4o service for data points; it handles all database requests involving data points.
 * 
 * @author schester
 *
 */
public class DataPointService {
	
	/**
	 * 
	 * This method saves a given DataPoint
	 * 
	 * @param dp
	 * @return
	 */
	public static DataPoint savePoint(DataPoint dp){
		
		ObjectContainer db = Util.openDb();
		
		try {
			db.store(dp);
		} finally {
			db.close();
		}
		
		return new DataPoint(dp);
	}
	
	
	/**
	 * This method returns all points on a given day of the week during a given hour
	 * within the given bounds and on the specified layer
	 * 
	 * @param maxLat
	 * @param maxLng
	 * @param minLat
	 * @param minLng
	 * @param date
	 * @return
	 */
	public static DataPointSet getPointsByDayOfWeek(final Double maxLat, final Double maxLng, final Double minLat, final Double minLng, Date date, final Layer layer){

		TimeZone tz = TimeZone.getDefault();

		final GregorianCalendar requestTime = new GregorianCalendar(tz);

		requestTime.setTime(date);

		ObjectContainer db = Util.openDb();

		try {
			// All of the following queries follow the same structure as this one;
			// it cycles through all the points, and adds to the List<DataPoints> those for which the match method returns true
			List<DataPoint> dataPoints = db.query(new Predicate<DataPoint>() {
				public boolean match(DataPoint candidate) {
					GregorianCalendar curCal = candidate.getCal();
					
					
					if ( candidate.getLat() <= maxLat 
					  && candidate.getLat() >= minLat 
					  && candidate.getLng() <= maxLng 
					  && candidate.getLng() >= minLng
					  && candidate.getLayer() == layer
					  && curCal.get(Calendar.DAY_OF_WEEK) == requestTime.get(Calendar.DAY_OF_WEEK)
					  && curCal.get(Calendar.HOUR_OF_DAY) == requestTime.get(Calendar.HOUR_OF_DAY)
					   ) {

						return true;
					} else {
						return false;
					}
				}
			});

			DataPointSet pointsSet = new DataPointSet();
			
			//Copy the point into a new point, we dont want to need db4o later on when we refer to the point
			for(DataPoint dp : dataPoints){
				DataPoint dataPoint = new DataPoint(dp);
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
		} finally {
			db.close();
		}
	}
	
	/**
	 * This method returns all points on a given day of the week during the specified timerange and on the specified layer
	 * 
	 * @param maxLat
	 * @param maxLng
	 * @param minLat
	 * @param minLng
	 * @param date
	 * @return
	 */
	public static DataPointSet getPointsByDayOfWeekAndTimeRange(final Double maxLat, final Double maxLng, final Double minLat, final Double minLng, final int day, final int startHour, final int endHour, final Layer layer){

		ObjectContainer db = Util.openDb();

		try {
			List<DataPoint> dataPoints = db.query(new Predicate<DataPoint>() {
				public boolean match(DataPoint candidate) {
					GregorianCalendar curCal = candidate.getCal();
					
					if ( candidate.getLat() <= maxLat 
					  && candidate.getLat() >= minLat 
					  && candidate.getLng() <= maxLng 
					  && candidate.getLng() >= minLng
					  && candidate.getLayer() == layer
					  && curCal.get(Calendar.DAY_OF_WEEK) == day
					  && curCal.get(Calendar.HOUR_OF_DAY) >= startHour
					  && curCal.get(Calendar.HOUR_OF_DAY) < endHour
					   ) {
						return true;
					} else {
						return false;
					}
				}
			});

			DataPointSet pointsSet = new DataPointSet();
			
			for(DataPoint dp : dataPoints){
				DataPoint dataPoint = new DataPoint(dp);
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
		} finally {
			db.close();
		}
	}

	/**
	 * This method returns all points on a given date within 30 mins prior to the request
	 * within the given bounds and on the specified layer
	 * @param maxLat
	 * @param maxLng
	 * @param minLat
	 * @param minLng
	 * @param date
	 * @return
	 */
	public static DataPointSet getPointsByDate(final Double maxLat, final Double maxLng, final Double minLat, final Double minLng, Date date, final Layer layer){

		TimeZone tz = TimeZone.getDefault();

		final GregorianCalendar requestTime = new GregorianCalendar(tz);

		requestTime.setTime(date);

		ObjectContainer db = Util.openDb();

		try {
			List<DataPoint> dataPoints = db.query(new Predicate<DataPoint>() {
				public boolean match(DataPoint candidate) {
					GregorianCalendar curCal = candidate.getCal();
					
					int year = curCal.get(Calendar.YEAR);
					
					if ( candidate.getLat() <= maxLat 
					  && candidate.getLat() >= minLat 
					  && candidate.getLng() <= maxLng 
					  && candidate.getLng() >= minLng
					  && candidate.getLayer() == layer
					  && curCal.get(Calendar.YEAR) == requestTime.get(Calendar.YEAR)
					  && curCal.get(Calendar.DAY_OF_YEAR) == requestTime.get(Calendar.DAY_OF_YEAR)
					  && curCal.getTimeInMillis() > requestTime.getTimeInMillis() - 1800000
					  && curCal.getTimeInMillis() <= requestTime.getTimeInMillis()
					   ) {

						return true;
					} else {
						return false;
					}
				}
			});

			DataPointSet pointsSet = new DataPointSet();

			for(DataPoint dp : dataPoints){
				DataPoint dataPoint = new DataPoint(dp);
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
			
		} finally {
			db.close();
		}
	}
	
	
	/**
	 * 
	 * Returns ALL points in the specified area range, primarily for debugging
	 * 
	 * @param maxLat
	 * @param maxLng
	 * @param minLat
	 * @param minLng
	 * @return
	 */
	public static DataPointSet getPointsNoDateOrLayer(final Double maxLat, final Double maxLng, final Double minLat, final Double minLng){
		ObjectContainer db = Util.openDb();

		try {
			List<DataPoint> dataPoints = db.query(new Predicate<DataPoint>() {
				public boolean match(DataPoint candidate) {
					if ( candidate.getLat() <= maxLat 
					  && candidate.getLat() >= minLat 
					  && candidate.getLng() <= maxLng 
					  && candidate.getLng() >= minLng
					   ) {

						return true;
					} else {
						return false;
					}
				}
			});

			DataPointSet pointsSet = new DataPointSet();
			
			for(DataPoint dp : dataPoints){
				DataPoint dataPoint = new DataPoint(dp);
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
		} finally {
			db.close();
		}
	}

}
