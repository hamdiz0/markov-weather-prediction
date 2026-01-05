import { useState, useRef } from 'react';
import { Sun, Cloud, CloudRain, Wind, CloudLightning, CloudDrizzle, ArrowRight } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const WEATHER_STATES = [
  { 
    id: 'Sunny', 
    label: 'Sunny', 
    icon: Sun, 
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    bgGlow: 'rgba(251, 191, 36, 0.15)'
  },
  { 
    id: 'PartlyCloudy', 
    label: 'Partly Cloudy', 
    icon: Cloud, 
    color: '#a3e635',
    gradient: 'linear-gradient(135deg, #a3e635, #84cc16)',
    bgGlow: 'rgba(163, 230, 53, 0.15)'
  },
  { 
    id: 'Cloudy', 
    label: 'Cloudy', 
    icon: CloudDrizzle, 
    color: '#94a3b8',
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
    bgGlow: 'rgba(148, 163, 184, 0.15)'
  },
  { 
    id: 'Windy', 
    label: 'Windy', 
    icon: Wind, 
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    bgGlow: 'rgba(56, 189, 248, 0.15)'
  },
  { 
    id: 'Rainy', 
    label: 'Rainy', 
    icon: CloudRain, 
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    bgGlow: 'rgba(99, 102, 241, 0.15)'
  },
  { 
    id: 'ThunderStorm', 
    label: 'Thunder Storm', 
    icon: CloudLightning, 
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
    bgGlow: 'rgba(168, 85, 247, 0.15)'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function WeatherStateSelector({ onSelect, matrixData, onPredictionDataReady }) {
  const [selectedState, setSelectedState] = useState(null);
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const predictionPanelRef = useRef(null);

  const scrollToPredictionPanel = () => {
    if (predictionPanelRef.current) {
      const yOffset = -100;
      const element = predictionPanelRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const handleSelectState = (stateId) => {
    setSelectedState(stateId);
    if (onSelect) {
      onSelect(stateId);
    }
    // Scroll to prediction panel after selection
    setTimeout(scrollToPredictionPanel, 150);
  };

  const apiUrl = `${import.meta.env.VITE_API_URL}/api/predict`;

  const handlePredict = async () => {
    if (!selectedState || !matrixData) {
      return;
    }

    setIsLoading(true);

    const predictionData = {
      currentState: selectedState,
      days: parseInt(days),
      matrixData: matrixData
    };

    try {
      const response = await axios.post(apiUrl, predictionData);
      const result = response.data;
      onPredictionDataReady(result);
      setTimeout(() => {
        document.getElementById("prediction_results").scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWeather = WEATHER_STATES.find(s => s.id === selectedState);

  return (
    <AnimatePresence>
      {matrixData && (
        <Section
          as={motion.section}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          id="today"
        >
          <SectionBackground $selectedColor={selectedWeather?.bgGlow} />
          
          <ContentWrapper>
            <Header>
              <SectionLabel>
                <span className="number">03</span>
                <span className="text">Select</span>
              </SectionLabel>
              <Title>TODAY'S WEATHER</Title>
              <Description>
                Look outside and select the current weather condition to begin prediction
              </Description>
            </Header>

            <WeatherGrid
              as={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {WEATHER_STATES.map((state) => {
                const IconComponent = state.icon;
                const isSelected = selectedState === state.id;

                return (
                  <WeatherCard
                    key={state.id}
                    as={motion.div}
                    variants={cardVariants}
                    onClick={() => handleSelectState(state.id)}
                    $isSelected={isSelected}
                    $accentColor={state.color}
                    $gradient={state.gradient}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CardGlow $color={state.color} $isSelected={isSelected} />
                    <IconWrapper $gradient={state.gradient} $isSelected={isSelected}>
                      <IconComponent 
                        size={32} 
                        strokeWidth={1.5}
                      />
                    </IconWrapper>
                    <CardLabel>{state.label}</CardLabel>
                    <SelectIndicator $isSelected={isSelected}>
                      {isSelected ? 'Selected' : 'Select'}
                    </SelectIndicator>
                  </WeatherCard>
                );
              })}
            </WeatherGrid>

            <AnimatePresence>
              {selectedState && (
                <PredictionPanel
                  ref={predictionPanelRef}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PanelContent>
                    <CurrentState>
                      <StateLabel>Current State</StateLabel>
                      <StateDisplay $color={selectedWeather?.color}>
                        {selectedWeather && (
                          <>
                            <selectedWeather.icon size={24} />
                            <span>{selectedWeather.label}</span>
                          </>
                        )}
                      </StateDisplay>
                    </CurrentState>

                    <DaysInput>
                      <DaysLabel>Forecast Days</DaysLabel>
                      <DaysControl>
                        <DaysButton 
                          onClick={() => setDays(Math.max(1, days - 1))}
                          disabled={days <= 1}
                        >
                          -
                        </DaysButton>
                        <DaysValue>{days}</DaysValue>
                        <DaysButton 
                          onClick={() => setDays(Math.min(30, days + 1))}
                          disabled={days >= 30}
                        >
                          +
                        </DaysButton>
                      </DaysControl>
                    </DaysInput>

                    <PredictButton
                      onClick={handlePredict}
                      disabled={isLoading}
                      as={motion.button}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <ButtonSpinner />
                      ) : (
                        <>
                          <span>Generate Forecast</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </PredictButton>
                  </PanelContent>

                  <PanelDecoration>
                    <DecoLine style={{ '--delay': '0s' }} />
                    <DecoLine style={{ '--delay': '0.1s' }} />
                    <DecoLine style={{ '--delay': '0.2s' }} />
                  </PanelDecoration>
                </PredictionPanel>
              )}
            </AnimatePresence>
          </ContentWrapper>
        </Section>
      )}
    </AnimatePresence>
  );
}

// Keyframes
const pulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const slideIn = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

// Styled Components
const Section = styled.section`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-lg);
  overflow: hidden;
`;

const SectionBackground = styled.div`
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 60% 40% at 50% 50%, ${props => props.$selectedColor || 'transparent'}, transparent),
    radial-gradient(ellipse 80% 50% at 80% 20%, rgba(245, 158, 11, 0.06), transparent),
    linear-gradient(180deg, var(--bg-secondary), var(--bg-primary));
  z-index: -1;
  transition: background 0.6s ease;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--space-2xl);
`;

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  
  .number {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent-tertiary);
    padding: 4px 8px;
    background: rgba(245, 158, 11, 0.1);
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
  max-width: 500px;
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  width: 100%;
  margin-bottom: var(--space-2xl);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const WeatherCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xl) var(--space-lg);
  background: ${props => props.$isSelected 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$isSelected 
    ? props.$accentColor 
    : 'var(--border-subtle)'};
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border-strong);
  }
`;

const CardGlow = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, ${props => props.$color}20, transparent 50%);
  opacity: ${props => props.$isSelected ? 1 : 0};
  transition: opacity var(--transition-base);
  pointer-events: none;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: ${props => props.$isSelected ? props.$gradient : 'var(--bg-elevated)'};
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
  color: ${props => props.$isSelected ? '#fff' : 'var(--text-secondary)'};
  transition: all var(--transition-base);
  animation: ${props => props.$isSelected ? float : 'none'} 3s ease-in-out infinite;
  
  ${WeatherCard}:hover & {
    background: ${props => props.$gradient};
    color: #fff;
  }
`;

const CardLabel = styled.span`
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
`;

const SelectIndicator = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.$isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'};
  transition: color var(--transition-fast);
`;

const PredictionPanel = styled.div`
  width: 100%;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
    opacity: 0.5;
  }
`;

const PanelContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CurrentState = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
`;

const StateLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
`;

const StateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: ${props => props.$color || 'var(--text-primary)'};
  
  span {
    font-family: var(--font-body);
    font-size: 1.125rem;
    font-weight: 600;
  }
`;

const DaysInput = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
`;

const DaysLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
`;

const DaysControl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-xs);
`;

const DaysButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 1.25rem;
  font-weight: 300;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const DaysValue = styled.span`
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
  text-align: center;
`;

const PredictButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--bg-primary);
  background: linear-gradient(135deg, var(--accent-primary), #00a8cc);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 180px;
  justify-content: center;
  
  &:hover:not(:disabled) {
    box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: var(--bg-primary);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const PanelDecoration = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  display: flex;
  gap: 4px;
  padding: 0 var(--space-xl);
`;

const DecoLine = styled.div`
  flex: 1;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  transform-origin: left;
  animation: ${slideIn} 0.6s ease calc(var(--delay)) forwards;
  transform: scaleX(0);
`;
