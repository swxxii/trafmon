package au.com.trafmon;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.TimeZone;

import au.com.trafmon.DataPoint.Layer;

import com.db4o.ObjectContainer;
import com.db4o.query.Predicate;

public class DataPointService {
	
	/**
	 * This method returns all points on a given day of the week during a given hour
	 * within the given bounds
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
			List<DataPoint> dataPoints = db.query(new Predicate<DataPoint>() {
				public boolean match(DataPoint candidate) {
					GregorianCalendar curCal = candidate.getCal();
					// Check we are within the bounds specified, and within the hour specified.
					// Currently this will get all points, for example, that were made on a Tuesday at 4pm within the given bounds
					// It will NOT get all points that, for example, were made on the 4th of July 2008 between 4pm and 4:05pm within the given bounds
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
			
			for(DataPoint dp : dataPoints){
				DataPoint dataPoint = new DataPoint();
				dataPoint.setBearing(dp.getBearing());
				dataPoint.setCal(dp.getCal());
				dataPoint.setLat(dp.getLat());
				dataPoint.setLng(dp.getLng());
				dataPoint.setSpeed(dp.getSpeed());
				dataPoint.setTag(dp.getTag());
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
		} finally {
			db.close();
		}
	}
	
	/**
	 * This method returns all points on a given day of the week during the specified timerange
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
					// Check we are within the bounds specified, and within the hour range specified
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
				DataPoint dataPoint = new DataPoint();
				dataPoint.setBearing(dp.getBearing());
				dataPoint.setCal(dp.getCal());
				dataPoint.setLat(dp.getLat());
				dataPoint.setLng(dp.getLng());
				dataPoint.setSpeed(dp.getSpeed());
				dataPoint.setTag(dp.getTag());
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
		} finally {
			db.close();
		}
	}

	/**
	 * This method returns all points on a given date during a given hour
	 * within the given bounds
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
					
					// Check we are within the bounds specified, and within the hour specified.
					// Currently this will get all points, for example, that were made today within 30mins of the current time
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
				DataPoint dataPoint = new DataPoint();
				dataPoint.setBearing(dp.getBearing());
				dataPoint.setCal(dp.getCal());
				dataPoint.setLat(dp.getLat());
				dataPoint.setLng(dp.getLng());
				dataPoint.setSpeed(dp.getSpeed());
				dataPoint.setTag(dp.getTag());
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
					// Check we are within the bounds specified
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
				DataPoint dataPoint = new DataPoint();
				dataPoint.setBearing(dp.getBearing());
				dataPoint.setCal(dp.getCal());
				dataPoint.setLat(dp.getLat());
				dataPoint.setLng(dp.getLng());
				dataPoint.setSpeed(dp.getSpeed());
				dataPoint.setTag(dp.getTag());
				pointsSet.addDataPoint(dataPoint);
			}

			return pointsSet;
		} finally {
			db.close();
		}
	}

}
