package au.com.trafmon;

import java.util.Date;

public class DataPoint {
	
	private double lat;
	private double lng;
	private double speed;
	private Date date;
	
	public DataPoint(double lat, double lng, double speed, Date date) {
		super();
		this.lat = lat;
		this.lng = lng;
		this.speed = speed;
		this.date = date;
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
	public double getSpeed() {
		return speed;
	}
	public void setSpeed(double speed) {
		this.speed = speed;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}

}
