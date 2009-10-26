package au.com.trafmon;

import java.util.Date;
import java.util.GregorianCalendar;

public class DataPoint {
	
	private double lat;
	private double lng;
	private int bearing;
	private double speed;
	private GregorianCalendar cal;
	
	public DataPoint(double lat, double lng, int bearing, double speed, GregorianCalendar date) {
		super();
		this.lat = lat;
		this.lng = lng;
		this.bearing = bearing;
		this.speed = speed;
		this.cal = date;
	}
	
	public double getLat() {
		return lat;
	}
	public void setLat(double lat) {
		this.lat = lat;
	}
	public double getLng() {
		return lng;
	}
	public void setLng(double lng) {
		this.lng = lng;
	}
	public int getBearing() {
		return bearing;
	}
	public void setBearing(int bearing) {
		this.bearing = bearing;
	}
	public double getSpeed() {
		return speed;
	}
	public void setSpeed(double speed) {
		this.speed = speed;
	}
	public GregorianCalendar getCal() {
		return cal;
	}
	public void setCal(GregorianCalendar cal) {
		this.cal = cal;
	}

}
