import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { Cloud, Sun, CloudRain, Wind, CloudLightning, CloudDrizzle, TrendingUp, PieChartIcon, BarChart3, Calendar } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const STATE_COLORS = {
  Sunny: '#fbbf24',
  PartlyCloudy: '#a3e635',
  Cloudy: '#94a3b8',
  Windy: '#38bdf8',
  Rainy: '#6366f1',
  ThunderStorm: '#a855f7'
};

const STATE_ICONS = {
  Sunny: Sun,
  PartlyCloudy: Cloud,
  Cloudy: CloudDrizzle,
  Windy: Wind,
  Rainy: CloudRain,
  ThunderStorm: CloudLightning
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <TooltipLabel>{label}</TooltipLabel>
        {payload.map((entry, index) => (
          <TooltipItem key={index} style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span>{(entry.value * 100).toFixed(1)}%</span>
          </TooltipItem>
        ))}
      </TooltipContainer>
    );
  }
  return null;
};

export default function PredictionResults({ predictionData }) {
  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return <Section id="prediction_results" />;
  }

  const predictions = predictionData.predictions;
  const tableDaysToShow = Math.min(10, predictions.length);
  
  const tableData = predictions.slice(0, tableDaysToShow).map((pred, idx) => ({
    day: idx + 1,
    dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : `Day ${idx + 1}`,
    state: pred.mostLikelyState,
    ...pred.probabilities
  }));

  let chartData = predictions;
  if (predictions.length > 30) {
    const step = Math.ceil(predictions.length / 30);
    chartData = predictions.filter((_, idx) => idx % step === 0);
  }

  const evolutionData = chartData.map((pred) => ({
    day: `Day ${pred.day}`,
    ...pred.probabilities
  }));

  const mostLikelyState = tableData[0].state;
  const MostLikelyIcon = STATE_ICONS[mostLikelyState];

  // Calculate average probabilities
  const avgProbs = {};
  Object.keys(STATE_COLORS).forEach(state => {
    avgProbs[state] = (
      predictions.reduce((sum, pred) => sum + (pred.probabilities[state] || 0), 0) / predictions.length
    );
  });

  const pieData = Object.entries(avgProbs)
    .map(([state, prob]) => ({
      name: state,
      value: prob,
      color: STATE_COLORS[state]
    }))
    .sort((a, b) => b.value - a.value);

  // Find dominant state
  const dominantState = pieData[0];

  return (
    <Section
      as={motion.section}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      id="prediction_results"
    >
      <SectionBackground />
      
      <ContentWrapper>
        <Header>
          <SectionLabel>
            <span className="number">04</span>
            <span className="text">Results</span>
          </SectionLabel>
          <Title>WEATHER FORECAST</Title>
          <Description>
            Markov chain predictions for the next {predictions.length} days
          </Description>
        </Header>

        {/* Hero Stats */}
        <HeroStats
          as={motion.div}
          variants={cardVariants}
        >
          <HeroStatItem>
            <StatIcon style={{ background: STATE_COLORS[mostLikelyState] + '20', color: STATE_COLORS[mostLikelyState] }}>
              <MostLikelyIcon size={24} />
            </StatIcon>
            <StatContent>
              <StatValue style={{ color: STATE_COLORS[mostLikelyState] }}>{mostLikelyState}</StatValue>
              <StatLabel>Most Likely Today</StatLabel>
            </StatContent>
          </HeroStatItem>
          
          <StatDivider />
          
          <HeroStatItem>
            <StatIcon style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--accent-primary)' }}>
              <Calendar size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{predictions.length}</StatValue>
              <StatLabel>Days Forecasted</StatLabel>
            </StatContent>
          </HeroStatItem>
          
          <StatDivider />
          
          <HeroStatItem>
            <StatIcon style={{ background: dominantState.color + '20', color: dominantState.color }}>
              <TrendingUp size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{(dominantState.value * 100).toFixed(0)}%</StatValue>
              <StatLabel>Dominant: {dominantState.name}</StatLabel>
            </StatContent>
          </HeroStatItem>
        </HeroStats>

        {/* Charts Grid */}
        <ChartsGrid>
          {/* Evolution Chart */}
          <ChartCard
            as={motion.div}
            variants={cardVariants}
            $span="2"
          >
            <CardHeader>
              <CardIcon>
                <TrendingUp size={18} />
              </CardIcon>
              <CardTitle>Probability Evolution</CardTitle>
            </CardHeader>
            <CardDescription>
              How weather state probabilities change over time
            </CardDescription>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    {Object.entries(STATE_COLORS).map(([state, color]) => (
                      <linearGradient key={state} id={`gradient-${state}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {Object.keys(STATE_COLORS).map(state => (
                    <Area
                      key={state}
                      type="monotone"
                      dataKey={state}
                      stroke={STATE_COLORS[state]}
                      fill={`url(#gradient-${state})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartLegend>
              {Object.entries(STATE_COLORS).map(([state, color]) => (
                <LegendItem key={state}>
                  <LegendDot style={{ background: color }} />
                  <span>{state}</span>
                </LegendItem>
              ))}
            </ChartLegend>
          </ChartCard>

          {/* Pie Chart */}
          <ChartCard
            as={motion.div}
            variants={cardVariants}
          >
            <CardHeader>
              <CardIcon>
                <PieChartIcon size={18} />
              </CardIcon>
              <CardTitle>Average Distribution</CardTitle>
            </CardHeader>
            <CardDescription>
              Overall probability across forecast period
            </CardDescription>
            <ChartWrapper $height="240px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${(value * 100).toFixed(1)}%`}
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <PieStats>
              {pieData.slice(0, 3).map((item, idx) => (
                <PieStatItem key={item.name}>
                  <PieStatRank style={{ background: item.color + '20', color: item.color }}>
                    #{idx + 1}
                  </PieStatRank>
                  <PieStatName>{item.name}</PieStatName>
                  <PieStatValue>{(item.value * 100).toFixed(1)}%</PieStatValue>
                </PieStatItem>
              ))}
            </PieStats>
          </ChartCard>

          {/* Bar Chart */}
          <ChartCard
            as={motion.div}
            variants={cardVariants}
          >
            <CardHeader>
              <CardIcon>
                <BarChart3 size={18} />
              </CardIcon>
              <CardTitle>Daily Breakdown</CardTitle>
            </CardHeader>
            <CardDescription>
              Stacked probabilities for first {tableDaysToShow} days
            </CardDescription>
            <ChartWrapper $height="240px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableData.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="dayName" 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {Object.keys(STATE_COLORS).map(state => (
                    <Bar
                      key={state}
                      dataKey={state}
                      fill={STATE_COLORS[state]}
                      stackId="a"
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </ChartCard>
        </ChartsGrid>

        {/* Forecast Table */}
        <TableCard
          as={motion.div}
          variants={cardVariants}
        >
          <CardHeader>
            <CardIcon>
              <Calendar size={18} />
            </CardIcon>
            <CardTitle>Detailed Forecast</CardTitle>
          </CardHeader>
          <CardDescription>
            Day-by-day predictions with most likely states
          </CardDescription>
          
          <ForecastTable>
            <thead>
              <tr>
                <th>Day</th>
                <th>Weather</th>
                <th>Confidence</th>
                <th>All Probabilities</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((day, idx) => {
                const Icon = STATE_ICONS[day.state] || Sun;
                const confidence = day[day.state];
                return (
                  <TableRow
                    key={idx}
                    as={motion.tr}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td>
                      <DayCell>
                        <DayNumber>{day.day}</DayNumber>
                        <DayName>{day.dayName}</DayName>
                      </DayCell>
                    </td>
                    <td>
                      <WeatherCell>
                        <WeatherIcon style={{ background: STATE_COLORS[day.state] + '20' }}>
                          <Icon size={18} color={STATE_COLORS[day.state]} />
                        </WeatherIcon>
                        <WeatherName style={{ color: STATE_COLORS[day.state] }}>
                          {day.state}
                        </WeatherName>
                      </WeatherCell>
                    </td>
                    <td>
                      <ConfidenceCell>
                        <ConfidenceBar>
                          <ConfidenceFill 
                            style={{ 
                              width: `${confidence * 100}%`,
                              background: STATE_COLORS[day.state]
                            }} 
                          />
                        </ConfidenceBar>
                        <ConfidenceValue>{(confidence * 100).toFixed(1)}%</ConfidenceValue>
                      </ConfidenceCell>
                    </td>
                    <td>
                      <ProbabilityBars>
                        {Object.entries(STATE_COLORS).map(([state, color]) => (
                          <ProbBar 
                            key={state}
                            style={{ 
                              width: `${day[state] * 100}%`,
                              background: color
                            }}
                            title={`${state}: ${(day[state] * 100).toFixed(1)}%`}
                          />
                        ))}
                      </ProbabilityBars>
                    </td>
                  </TableRow>
                );
              })}
            </tbody>
          </ForecastTable>
        </TableCard>
      </ContentWrapper>
    </Section>
  );
}

// Styled Components
const Section = styled.section`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4xl) var(--space-lg);
  overflow: hidden;
`;

const SectionBackground = styled.div`
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 60% 30% at 30% 20%, rgba(0, 212, 255, 0.08), transparent),
    radial-gradient(ellipse 50% 40% at 70% 70%, rgba(124, 58, 237, 0.06), transparent),
    linear-gradient(180deg, var(--bg-primary), var(--bg-secondary));
  z-index: -1;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
`;

const Header = styled.div`
  text-align: center;
`;

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  
  .number {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent-primary);
    padding: 4px 8px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: var(--radius-sm);
  }
  
  .text {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
  }
`;

const Title = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
`;

const Description = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2xl);
  padding: var(--space-xl);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-lg);
  }
`;

const HeroStatItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--text-primary);
`;

const StatLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
`;

const StatDivider = styled.div`
  width: 1px;
  height: 50px;
  background: var(--border-default);
  
  @media (max-width: 768px) {
    width: 50px;
    height: 1px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  grid-column: ${props => props.$span ? `span ${props.$span}` : 'auto'};
  
  @media (max-width: 900px) {
    grid-column: auto;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
`;

const CardIcon = styled.div`
  color: var(--accent-primary);
`;

const CardTitle = styled.h3`
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: none;
`;

const CardDescription = styled.p`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: var(--space-lg);
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: ${props => props.$height || '280px'};
`;

const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  justify-content: center;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

const PieStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
`;

const PieStatItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
`;

const PieStatRank = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
`;

const PieStatName = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const PieStatValue = styled.span`
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const TableCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  overflow: hidden;
`;

const ForecastTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: var(--space-md);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    border-bottom: 1px solid var(--border-default);
  }
  
  td {
    padding: var(--space-md);
    border-bottom: 1px solid var(--border-subtle);
  }
`;

const TableRow = styled.tr`
  transition: background var(--transition-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const DayCell = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const DayNumber = styled.span`
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-primary);
  width: 24px;
`;

const DayName = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const WeatherCell = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const WeatherIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
`;

const WeatherName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;

const ConfidenceCell = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const ConfidenceBar = styled.div`
  width: 80px;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const ConfidenceValue = styled.span`
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  min-width: 50px;
`;

const ProbabilityBars = styled.div`
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-tertiary);
`;

const ProbBar = styled.div`
  height: 100%;
  transition: width 0.3s ease;
`;

const TooltipContainer = styled.div`
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-elevated);
`;

const TooltipLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TooltipItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  font-size: 0.85rem;
  
  span:last-child {
    font-family: var(--font-mono);
    font-weight: 600;
  }
`;
