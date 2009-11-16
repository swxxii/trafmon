package au.com.trafmon;

import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;

public class DataPoint {
	
	public enum Layer { CAR, PUBLIC }

	private double lat;
	private double lng;
	private int bearing;
	private int speed;
	private String tag;
	private GregorianCalendar cal;
	private Layer layer;

	public DataPoint(double lat, double lng, int bearing, int speed, String tag, GregorianCalendar date, Layer layer) {
		super();
		this.lat = lat;
		this.lng = lng;
		this.bearing = bearing;
		this.speed = speed;
		this.tag = tag;
		this.cal = date;
		this.layer = layer;
	}

	public DataPoint(double lat, double lng, int bearing, int speed, String tag, Date date, Layer layer) {
		super();
		this.lat = lat;
		this.lng = lng;
		this.bearing = bearing;
		this.speed = speed;
		this.tag = tag;
		
		TimeZone tz = TimeZone.getDefault();
		GregorianCalendar newCal = new GregorianCalendar(tz);
		newCal.setTime(date);
		this.cal = newCal;
		
		this.layer = layer;
	}

	public DataPoint() {
		// TODO Auto-generated constructor stub
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

	public int getSpeed() {
		return speed;
	}

	public void setSpeed(int speed) {
		this.speed = speed;
	}

	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	public GregorianCalendar getCal() {
		return cal;
	}

	public void setCal(GregorianCalendar cal) {
		this.cal = cal;
	}

	public Layer getLayer() {
		return layer;
	}

	public void setLayer(Layer layer) {
		this.layer = layer;
	}

}
