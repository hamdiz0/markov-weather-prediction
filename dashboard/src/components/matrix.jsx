import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ChevronRight, Cloud } from 'lucide-react';
import axios from 'axios';

import fullBackData from "../data/matrix.json";
import MatrixForm from './matrixForm.jsx';

const states = ['Sunny', 'PartlyCloudy', 'Cloudy', 'Windy', 'Rainy', 'ThunderStorm'];

const stateLabels = {
  'Sunny': 'SUN',
  'PartlyCloudy': 'P.CLD',
  'Cloudy': 'CLD',
  'Windy': 'WND',
  'Rainy': 'RAIN',
  'ThunderStorm': 'STRM'
};

// Get color intensity based on probability value
const getHeatmapColor = (value) => {
  const numValue = parseFloat(value);
  if (numValue >= 0.5) return { bg: 'rgba(0, 212, 255, 0.8)', text: '#000' };
  if (numValue >= 0.3) return { bg: 'rgba(0, 212, 255, 0.5)', text: '#fff' };
  if (numValue >= 0.2) return { bg: 'rgba(124, 58, 237, 0.5)', text: '#fff' };
  if (numValue >= 0.1) return { bg: 'rgba(124, 58, 237, 0.3)', text: '#fff' };
  if (numValue >= 0.05) return { bg: 'rgba(245, 158, 11, 0.3)', text: '#fff' };
  return { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-tertiary)' };
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  }
};

const matrixVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.02, duration: 0.3 }
  })
};

const nextStepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

function Loading({ loadingRef }) {
  return (
    <LoadingContainer
      ref={loadingRef}
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner>
        <SpinnerRing />
        <SpinnerCore />
      </LoadingSpinner>
      <LoadingText>Computing transition probabilities...</LoadingText>
      <LoadingSubtext>Analyzing historical weather data</LoadingSubtext>
    </LoadingContainer>
  );
}

export default function Matrix({ onDataReady }) {
  const [showTable, setShowTable] = useState("request");
  const [Data, setData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const matrixResultRef = useRef(null);
  const loadingRef = useRef(null);

  const scrollToLoading = () => {
    if (loadingRef.current) {
      const yOffset = -150;
      const element = loadingRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const scrollToMatrix = () => {
    if (matrixResultRef.current) {
      const yOffset = -100; // Offset to account for any fixed headers
      const element = matrixResultRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const scrollToNextStep = () => {
    const nextSection = document.getElementById('today');
    if (nextSection) {
      const yOffset = -50;
      const y = nextSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const handleGenerate = async (userData) => {
    if (isGenerating) return; // Prevent multiple clicks
    
    setIsGenerating(true);
    setShowTable("loading");
    setTimeout(scrollToLoading, 100);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/matrix`;
      const response = await axios.post(apiUrl, userData);
      const data = response.data;
      setData(data);
      onDataReady(data);
      setShowTable("ready");
      // Scroll to matrix after a short delay to let the animation start
      setTimeout(scrollToMatrix, 300);
    } catch (error) {
      setData(fullBackData);
      onDataReady(fullBackData);
      setShowTable("ready");
      setTimeout(scrollToMatrix, 300);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Section
      as={motion.section}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      id="matrix"
    >
      <SectionBackground />
      
      <ContentWrapper>
        <MatrixForm onSubmit={handleGenerate} isLoading={isGenerating} />
        
        <AnimatePresence mode="wait">
          {showTable === "loading" && <Loading key="loading" loadingRef={loadingRef} />}
          
          {showTable === "ready" && (
            <>
              <MatrixContainer
                ref={matrixResultRef}
                as={motion.div}
                variants={matrixVariants}
                initial="hidden"
                animate="visible"
                key="matrix"
              >
                <MatrixHeader>
                  <SectionLabel>
                    <span className="number">02</span>
                    <span className="text">Result</span>
                  </SectionLabel>
                  <MatrixTitle>TRANSITION MATRIX</MatrixTitle>
                  <MatrixDescription>
                    Probability of transitioning from one weather state to another
                  </MatrixDescription>
                </MatrixHeader>
                
                <HeatmapLegend>
                  <LegendLabel>Probability</LegendLabel>
                  <LegendScale>
                    <LegendItem style={{ background: 'rgba(255, 255, 255, 0.05)' }}>0%</LegendItem>
                    <LegendItem style={{ background: 'rgba(245, 158, 11, 0.3)' }}>5%</LegendItem>
                    <LegendItem style={{ background: 'rgba(124, 58, 237, 0.3)' }}>10%</LegendItem>
                    <LegendItem style={{ background: 'rgba(124, 58, 237, 0.5)' }}>20%</LegendItem>
                    <LegendItem style={{ background: 'rgba(0, 212, 255, 0.5)' }}>30%</LegendItem>
                    <LegendItem style={{ background: 'rgba(0, 212, 255, 0.8)', color: '#000' }}>50%+</LegendItem>
                  </LegendScale>
                </HeatmapLegend>

                <MatrixGrid>
                  {/* Corner cell */}
                  <CornerCell>
                    <span>FROM / TO</span>
                  </CornerCell>
                  
                  {/* Header row */}
                  {states.map((state) => (
                    <HeaderCell key={`header-${state}`}>
                      {stateLabels[state]}
                    </HeaderCell>
                  ))}
                  
                  {/* Data rows */}
                  {Object.entries(Data).map(([rowKey, rowData], rowIndex) => (
                    <React.Fragment key={rowKey}>
                      <RowLabel>{stateLabels[rowKey]}</RowLabel>
                      {Object.entries(rowData).map(([colKey, value], colIndex) => {
                        const colors = getHeatmapColor(value);
                        const cellIndex = rowIndex * 6 + colIndex;
                        return (
                          <DataCell
                            key={`${rowKey}-${colKey}`}
                            as={motion.div}
                            variants={cellVariants}
                            custom={cellIndex}
                            style={{ 
                              background: colors.bg,
                              color: colors.text
                            }}
                            whileHover={{ scale: 1.1, zIndex: 10 }}
                          >
                            <CellValue>{(parseFloat(value) * 100).toFixed(1)}%</CellValue>
                          </DataCell>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </MatrixGrid>

                <MatrixFooter>
                  <FooterNote>
                    <span className="icon">i</span>
                    Higher values indicate stronger transition probabilities between weather states
                  </FooterNote>
                </MatrixFooter>
              </MatrixContainer>

              {/* Next Step CTA */}
              <NextStepContainer
                as={motion.div}
                variants={nextStepVariants}
                initial="hidden"
                animate="visible"
              >
                <NextStepCard
                  as={motion.div}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToNextStep}
                >
                  <NextStepGlow />
                  <NextStepContent>
                    <NextStepIcon>
                      <Cloud size={28} />
                    </NextStepIcon>
                    <NextStepText>
                      <NextStepLabel>Next Step</NextStepLabel>
                      <NextStepTitle>SELECT TODAY'S WEATHER</NextStepTitle>
                      <NextStepDescription>
                        Choose the current weather condition to generate your forecast
                      </NextStepDescription>
                    </NextStepText>
                    <NextStepArrow>
                      <ChevronRight size={24} />
                    </NextStepArrow>
                  </NextStepContent>
                  <ProgressBar>
                    <ProgressFill />
                  </ProgressBar>
                </NextStepCard>

                <ScrollHint
                  as={motion.div}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowDown size={20} />
                  <span>Scroll or click to continue</span>
                </ScrollHint>
              </NextStepContainer>
            </>
          )}
        </AnimatePresence>
      </ContentWrapper>
    </Section>
  );
}

// Keyframes
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const progressFill = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
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
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124, 58, 237, 0.08), transparent),
    linear-gradient(180deg, var(--bg-primary), var(--bg-secondary));
  z-index: -1;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3xl);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl);
`;

const LoadingSpinner = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-xl);
`;

const SpinnerRing = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerCore = styled.div`
  position: absolute;
  inset: 20px;
  background: var(--accent-primary);
  border-radius: 50%;
  opacity: 0.2;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingText = styled.p`
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
`;

const LoadingSubtext = styled.p`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const MatrixContainer = styled.div`
  width: 100%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  padding: var(--space-2xl);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-secondary), transparent);
    opacity: 0.5;
  }
`;

const MatrixHeader = styled.div`
  text-align: center;
  margin-bottom: var(--space-xl);
`;

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  
  .number {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent-secondary);
    padding: 4px 8px;
    background: rgba(124, 58, 237, 0.1);
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

const MatrixTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
`;

const MatrixDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const HeatmapLegend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
`;

const LegendLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
`;

const LegendScale = styled.div`
  display: flex;
  gap: 2px;
`;

const LegendItem = styled.div`
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-secondary);
  border-radius: 2px;
`;

const MatrixGrid = styled.div`
  display: grid;
  grid-template-columns: auto repeat(6, 1fr);
  gap: 4px;
  margin-bottom: var(--space-xl);
  
  @media (max-width: 600px) {
    font-size: 0.75rem;
    gap: 2px;
  }
`;

const CornerCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
`;

const HeaderCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-xs);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--accent-primary);
  background: rgba(0, 212, 255, 0.1);
  border-radius: var(--radius-sm);
`;

const RowLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--accent-secondary);
  background: rgba(124, 58, 237, 0.1);
  border-radius: var(--radius-sm);
`;

const DataCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: default;
  transition: all var(--transition-fast);
  min-height: 50px;
`;

const CellValue = styled.span`
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
`;

const MatrixFooter = styled.div`
  display: flex;
  justify-content: center;
`;

const FooterNote = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.8rem;
  color: var(--text-tertiary);
  
  .icon {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    background: var(--bg-tertiary);
    border-radius: 50%;
    color: var(--text-secondary);
  }
`;

// Next Step Components
const NextStepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  width: 100%;
  max-width: 600px;
  margin-top: var(--space-xl);
`;

const NextStepCard = styled.div`
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--accent-tertiary);
    box-shadow: 0 20px 60px rgba(245, 158, 11, 0.15);
  }
`;

const NextStepGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent 50%);
  pointer-events: none;
`;

const NextStepContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
`;

const NextStepIcon = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-tertiary), #d97706);
  border-radius: var(--radius-lg);
  color: #fff;
  flex-shrink: 0;
`;

const NextStepText = styled.div`
  flex: 1;
`;

const NextStepLabel = styled.span`
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-tertiary);
  margin-bottom: var(--space-xs);
`;

const NextStepTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
`;

const NextStepDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`;

const NextStepArrow = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 50%;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  
  ${NextStepCard}:hover & {
    background: var(--accent-tertiary);
    color: #fff;
    transform: translateX(4px);
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--bg-tertiary);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--accent-tertiary), var(--accent-primary));
  animation: ${progressFill} 3s ease-out forwards;
`;

const ScrollHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-muted);
  
  span {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;
