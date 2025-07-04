import React, { useEffect, useRef, useState } from 'react'
import { PixelCard, PixelIcon } from './PixelComponents'

// 📊 Simple Progress Chart Component
interface ProgressChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  title: string
}

export const PixelProgressChart: React.FC<ProgressChartProps> = ({ data, title }) => {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setTimeout(() => setAnimated(true), 500)
  }, [])

  return (
    <PixelCard>
      <h3 className="text-lg font-semibold mb-6 pixel-text-gray-800">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="pixel-text-gray-700">{item.label}</span>
              <span className="font-semibold pixel-text-gray-800">{item.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: animated ? `${item.value}%` : '0%',
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  )
}

// 📈 Revenue Chart Component
interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    students: number
  }>
  title: string
}

export const PixelRevenueChart: React.FC<RevenueChartProps> = ({ data, title }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxRevenue = Math.max(...data.map(d => d.revenue))

  return (
    <PixelCard>
      <h3 className="text-lg font-semibold mb-6 pixel-text-gray-800">{title}</h3>
      <div className="relative">
        <div className="flex items-end justify-between h-64 space-x-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative w-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-700 ease-out"
                  style={{
                    height: `${(item.revenue / maxRevenue) * 240}px`,
                    minHeight: '20px'
                  }}
                />
                {hoveredIndex === index && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    ₹{item.revenue.toLocaleString()}
                    <br />
                    {item.students} students
                  </div>
                )}
              </div>
              <div className="text-xs pixel-text-gray-600 mt-2 text-center">
                {item.month}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PixelCard>
  )
}

// 🍩 Donut Chart Component
interface DonutChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  title: string
  centerValue?: string
  centerLabel?: string
}

export const PixelDonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  title, 
  centerValue, 
  centerLabel 
}) => {
  const [animated, setAnimated] = useState(false)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  useEffect(() => {
    setTimeout(() => setAnimated(true), 500)
  }, [])

  const createPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = {
      x: 50 + radius * Math.cos((startAngle * Math.PI) / 180),
      y: 50 + radius * Math.sin((startAngle * Math.PI) / 180)
    }
    const end = {
      x: 50 + radius * Math.cos((endAngle * Math.PI) / 180),
      y: 50 + radius * Math.sin((endAngle * Math.PI) / 180)
    }
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M 50,50 L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag},1 ${end.x},${end.y} Z`
  }

  let currentAngle = -90
  const paths = data.map(item => {
    const angle = (item.value / total) * 360
    const path = createPath(currentAngle, currentAngle + angle, 40)
    currentAngle += angle
    return { ...item, path, angle }
  })

  return (
    <PixelCard>
      <h3 className="text-lg font-semibold mb-6 pixel-text-gray-800">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            
            {/* Data segments */}
            {paths.map((item, index) => (
              <path
                key={index}
                d={item.path}
                fill={item.color}
                opacity={animated ? 0.8 : 0}
                className="transition-all duration-1000 ease-out"
                style={{
                  transitionDelay: `${index * 200}ms`
                }}
              />
            ))}
            
            {/* Center circle */}
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
          </svg>
          
          {/* Center text */}
          {centerValue && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold pixel-text-gray-800">{centerValue}</div>
                {centerLabel && (
                  <div className="text-xs pixel-text-gray-600">{centerLabel}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm pixel-text-gray-700">{item.label}</span>
            </div>
            <div className="text-sm font-semibold pixel-text-gray-800">
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  )
}

// 📍 Interactive Map Component
interface MapProps {
  centers: Array<{
    id: string
    name: string
    address: string
    lat: number
    lng: number
    students: number
    revenue: number
  }>
  onCenterClick?: (centerId: string) => void
}

export const PixelMap: React.FC<MapProps> = ({ centers, onCenterClick }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    setTimeout(() => setMapLoaded(true), 1000)
  }, [])

  const handleCenterClick = (centerId: string) => {
    setSelectedCenter(centerId)
    onCenterClick?.(centerId)
  }

  const getMarkerColor = (students: number) => {
    if (students > 200) return '#10b981' // green
    if (students > 100) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <PixelCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold pixel-text-gray-800">Training Centers Map</h3>
        <div className="flex items-center gap-2">
          <PixelIcon size="sm" color="primary">📍</PixelIcon>
          <span className="text-sm pixel-text-gray-600">{centers.length} Centers</span>
        </div>
      </div>
      
      <div className="relative">
        {!mapLoaded ? (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="pixel-bounce mb-4">
                <PixelIcon size="md" color="primary">🗺️</PixelIcon>
              </div>
              <p className="pixel-text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden">
            {/* Simulated map background */}
            <div className="absolute inset-0 bg-opacity-30 bg-gray-200">
              <div className="w-full h-full relative">
                {/* Simulated map markers */}
                {centers.map((center, index) => (
                  <div
                    key={center.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedCenter === center.id ? 'z-10' : 'z-0'
                    }`}
                    style={{
                      left: `${20 + (index * 15) % 60}%`,
                      top: `${30 + (index * 20) % 40}%`
                    }}
                    onClick={() => handleCenterClick(center.id)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300 hover:scale-125"
                      style={{ backgroundColor: getMarkerColor(center.students) }}
                    />
                    
                    {selectedCenter === center.id && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48">
                        <div className="font-semibold pixel-text-gray-800">{center.name}</div>
                        <div className="text-sm pixel-text-gray-600 mb-2">{center.address}</div>
                        <div className="flex justify-between text-xs">
                          <span className="pixel-text-gray-500">Students: {center.students}</span>
                          <span className="pixel-text-gray-500">Revenue: ₹{center.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <button className="w-8 h-8 bg-white rounded shadow hover:shadow-md flex items-center justify-center">
                <span className="text-sm">+</span>
              </button>
              <button className="w-8 h-8 bg-white rounded shadow hover:shadow-md flex items-center justify-center">
                <span className="text-sm">-</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm pixel-text-gray-600">200+ Students</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm pixel-text-gray-600">100-200 Students</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm pixel-text-gray-600">Under 100 Students</span>
        </div>
      </div>
    </PixelCard>
  )
}

// 📊 Analytics Dashboard Component
interface AnalyticsData {
  revenueData: Array<{
    month: string
    revenue: number
    students: number
  }>
  progressData: Array<{
    label: string
    value: number
    color: string
  }>
  distributionData: Array<{
    label: string
    value: number
    color: string
  }>
  centers: Array<{
    id: string
    name: string
    address: string
    lat: number
    lng: number
    students: number
    revenue: number
  }>
}

export const PixelAnalyticsDashboard: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PixelRevenueChart 
          data={data.revenueData} 
          title="Monthly Revenue Trend"
        />
        <PixelProgressChart 
          data={data.progressData} 
          title="Learning Progress"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PixelDonutChart 
          data={data.distributionData} 
          title="Student Distribution"
          centerValue="1,247"
          centerLabel="Total Students"
        />
        <PixelMap 
          centers={data.centers}
          onCenterClick={(id) => console.log('Center clicked:', id)}
        />
      </div>
    </div>
  )
}

// 📱 Mobile-Friendly Chart Component
export const PixelMobileChart: React.FC<{
  data: Array<{ label: string; value: number; color: string }>
  title: string
}> = ({ data, title }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <PixelCard>
      <h3 className="text-lg font-semibold mb-6 pixel-text-gray-800">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
              selectedIndex === index 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium pixel-text-gray-800">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="font-bold pixel-text-gray-800">{item.value}</div>
                <div className="text-xs pixel-text-gray-500">
                  {selectedIndex === index ? 'Tap to hide' : 'Tap for details'}
                </div>
              </div>
            </div>
            
            {selectedIndex === index && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PixelCard>
  )
}