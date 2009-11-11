package au.com.trafmon;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DataPointSet {
	
	private List<DataPoint> dataPoints;
	
	public DataPointSet(){
		this.dataPoints = new ArrayList<DataPoint>();
	}
	
	public DataPointSet(DataPoint dataPoint){
		this.dataPoints = new ArrayList<DataPoint>();
		this.dataPoints.add(dataPoint);
	}
	
	public DataPointSet(List<DataPoint> dataPoints){
		this.dataPoints = new ArrayList<DataPoint>();
		this.dataPoints.addAll(dataPoints);
	}
	
	public String toJSON(){
		String json = "[";
		
		Iterator<DataPoint> iter = this.dataPoints.iterator();

		DataPoint point;
		
		while(iter.hasNext()){
			point = iter.next();
			json += "{";
			json += "\"lat\":";
			json += "\"" + point.getLat() + "\",";
			json += "\"lng\":";
			json += "\"" + point.getLng() + "\",";
			json += "\"bearing\":";
			json += "\"" + point.getBearing() + "\",";
			json += "\"speed\":";
			json += "\"" + point.getSpeed() + "\",";
			json += "}";
			
			if(iter.hasNext()){
				json += ",";
			}
		}
		
		json += "]";
		
		return json;
	}

	public List<DataPoint> getDataPoints() {
		return dataPoints;
	}
	
	public void addDataPoint(DataPoint dataPoint){
		this.dataPoints.add(dataPoint);
	}

	public void setDataPoints(List<DataPoint> dataPoints) {
		this.dataPoints = dataPoints;
	}

}
