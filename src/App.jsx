import { useState, useEffect } from 'react'
import './App.scss'
import exampleImage from '/example.png'
import selectedImage from '/example.png'


function App() {
  const [experiment, setExperiment] = useState(0)
  const [dataset, setDataset] = useState(0)
  const [seed, setSeed] = useState(0)
  useEffect(() => {
    console.log('seed changed:', seed)
  }, [seed])
  const [visType, setVisType] = useState(0)
  const [windowSize, setWindowSize] = useState(10)
  const [userPromptText, setUserPromptText] = useState('')
  const [testPromptText, setTestPromptText] = useState('')

  const [groundTruthActivity, setGroundTruthActivity] = useState('')
  const [predictedActivity, setPredictedActivity] = useState('')
  const [correct, setCorrect] = useState(false)
  const [reason, setReason] = useState('')

  const [groundTruthActivityZero, setGroundTruthActivityZero] = useState('')
  const [predictedActivityZero, setPredictedActivityZero] = useState('')
  const [correctZero, setCorrectZero] = useState(false)
  const [reasonZero, setReasonZero] = useState('')

  const [systemPromptCollapsed, setSystemPromptCollapsed] = useState(true)
  const systemPrompt = `You are an domain expert specializing human activity recognition (HAR) using eye-tracking data. Your goal is to accurately determine whether the input eye-tracking data corresponds to a specific eye-tracking activity, based on provided data and context.

The task involves:
- Understanding the eye-tracking data.
- Using domain knowledge and context (e.g., sampling rate, window size, fixation/saccade patterns) to interpret eye-tracking behaviors.
- Applying expert reasoning to infer eye-tracking activity based on gaze patterns.

You will follow these decomposed steps:
1. Analyze the either visual or numerical patterns from the eye-tracking data.
2. Use context information to interpret the movement patterns.
3. Match the interpreted patterns to the target activity class.
4. Provide the answer with the requested format.

You will be given a prompt that includes:
- Activity descriptions for each class.
- Contextual information (e.g., sampling rate, window size, etc.).
- (optional) Example data for each activity class.
- Eye-tracking data (either visualizations or numerical text).

You must **strictly follow the output format**.
Do not include any additional explanations, justification, or additional content in your response.
Output the result in the following JSON format:
{
"predicted_activity": string,  // The predicted eye-tracking activity class from the provided options.
"reason": string               // A brief explanation of the reasoning behind the predicted activity.
}
`;

  const gazebase_activity_desc = {
    "Horizontal Saccades": "Participants followed a bull's-eye target moving horizontally ±15 degrees of visual angle from screen center, eliciting 30 degrees of visual angle horizontal saccades. The target maintained its position for one second before movement.",
    "Video Viewing": "Participants watched the first *The Hobbit: The Desolation of Smaug* trailer without audio, including natural eye movements during free viewing.",
    "Fixations": "Participants fixated on a static central bull's-eye target, maintaining gaze at the center of the display.",
    "Random Saccades": "Participants followed a bull's-eye target moving randomly across the screen, ranging from ±15 degrees of visual angle horizontally and ±9 degrees of visual angle vertically. The minimum degree of target movement was 2 degrees of visual angle, and each position is maintained for one second.",
    "Reading": "Participant read a passage from Lewis Carroll's *The Hunting of the Snark*, without receiving explicit instructions about what to do exactly.",
    "Balura Game": "Participants played a gaze-driven game which requires them to fixate on moving red balls to elimnate them while avoiding blue balls. Fixation feedback was provided via visual highlighting. Red balls sometimes required re-fixation."
  }

  const gazebase_map = {
    "Horizontal Saccades": "Horizontal_Saccades",
    "Video Viewing": "Video_1",
    "Fixations": "Fixations",
    "Random Saccades": "Random_Saccades",
    "Reading": "Reading",
    "Balura Game": "Balura_Game"
  }

  const sedentary_activity_desc = {
    "BROWSE": "Participants freely browsed the internet using a web browser, avoiding login-required or personal sites. They typically visited public news and blogs, sometimes in their first language, resulting in varied gaze patterns, including right-to-left reading for Persian webpages.",
    "INTERPRET": "Participants were presented with one of three short function implementations of increasing difficulty and were asked to predict the output of a code snippet.",
    "DEBUG": "Participants debugged a function implementation containing multiple errors (syntax, logic, arithmetic) and confirmed that their fix worked by executing the code, without consulting any resources outside the IDE.",
    "PLAY": "Participants played one of three simple online games after rule explanations: Mario (look ahead), Pong (follow object), or Agario (navigate in all directions). They used keyboard and mouse, with optional 1-minute training.",
    "READ": "Participants read one of three English materials: a book excerpt, an article, or a short story. The layout including fonts, spacing and paragraphs differed, with the article containing 5–6 line paragraphs and the book mixing speech and narration.",
    "SEARCH": "Participants used a search engine to answer predefined questions. Some answers appeared directly in results, while others required more effort. Browsing history was cleared before each session to ensure a common baseline.",
    "WATCH": "Participants watched a short 5–6 minute full-screen video (black-and-white animation, animated short, or independent film) featuring different numbers of characters. All selected videos were designed to be engaging and inspiring to sustain attention.",
    "WRITE": "Participants implemented one of three functions of increasing complexity, such as printing the product of a set of numbers, printing the first ten numbers in the Fibonacci sequence, and sorting a set of numbers in ascending order using bubble sort algorithm."
  }

  const desktop_activity_desc = {
    'BROWSE': "Participants browse public news websites or blogs. The websites visited by the participants are different: three participants gravitated toward visiting websites written in English while the other five participants visited websites written mainly in Chinese.",
    'PLAY': "Participants are asked to play simple online games among two different games: one requiring the participants to look ahead horizontally (Classic Super Mario), while the other requiring the participants to look in all directions to navigate the game character (Agario).",
    'READ': "Participants read digital content displayed on a computer screen. Three reading materials in English are prepared: a Wikipedia article, a research paper in a two-column format, a textbook in a single-column format. These materials differ in both text layout and the number of figures embedded.",
    'SEARCH': "Participants are asked to search for answers to a list of predefined questions using a web-based search engine. For each participant, the questions are randomly ordered to ensure variations (and thus, different visual stimuli). The search history is cleared before every session so that all participants start from the same baseline.",
    'WATCH': "Participants watch a short video played on the screen among two videos with a different number of main characters: one with two main characters and the other with more than three characters; also one video has subtitles shown on the bottom.",
    'WRITE': "Participants are asked to write an essay in English using the Microsoft Word installed on the computer."
  }

  const desc_map_all = {
    "gazebase": gazebase_activity_desc,
    "sedentary": sedentary_activity_desc,
    "desktop": desktop_activity_desc,
  }

  const visTypes = ["1_timeline_raw", "2_timeline_feat", "3_attention_raw", "4_attention_feat", "5_scanpath_raw", "6_scanpath_feat"]

  const datasetKeys = ["gazebase", "sedentary", "desktop"]

  const rotateList = (list, seed) => {
    const keys = Object.keys(list)
    if (keys.length === 0) return {}
    const k = ((seed % keys.length) + keys.length) % keys.length
    const rotatedKeys = [...keys.slice(k), ...keys.slice(0, k)]
    return rotatedKeys.reduce((acc, key) => {
      acc[key] = list[key]
      return acc
    }, {})
  }

  const [rotatedDesc, setRotatedDesc] = useState({})
  const [rotatedActs, setRotatedActs] = useState([])
  const [resultError, setResultError] = useState(false)
  const [resultErrorZero, setResultErrorZero] = useState(false)

  // Fetch result JSON whenever seed / visType / dataset / windowSize changes
  useEffect(() => {
    const datasetKey = datasetKeys[dataset] || datasetKeys[0]
    const activities = Object.keys(desc_map_all[datasetKey] || {})
    const activityIndex = Math.floor(seed / 30)
    const sampleIndex = seed % 30
    const activity = activities[activityIndex]
    const visTypeStr = visTypes[visType]
    if (!activity || !visTypeStr) return

    const path = `/results/results${windowSize}/${datasetKey}/${sampleIndex}/${activity}_${visTypeStr}.json`
    console.log(path)
    fetch(path)
      .then(res => { if (!res.ok) throw new Error('not found'); return res.json() })
      .then(data => {
        setGroundTruthActivity(data.ground_truth_activity ?? '')
        setPredictedActivity(data.predicted_activity ?? '')
        setCorrect(data.correct ?? false)
        setReason(data.reason ?? '')
        setResultError(false)
      })
      .catch(() => {
        setGroundTruthActivity('')
        setPredictedActivity('')
        setCorrect(false)
        setReason('')
        setResultError(true)
      })
    if (experiment === 0 && windowSize === 10) {
      const path_zero = `/results/results10_zero/${datasetKey}/${sampleIndex}/${activity}_${visTypeStr}.json`
      console.log(path_zero)
      fetch(path_zero)
        .then(res => { if (!res.ok) throw new Error('not found'); return res.json() })
        .then(data => {
          setGroundTruthActivityZero(data.ground_truth_activity ?? '')
          setPredictedActivityZero(data.predicted_activity ?? '')
          setCorrectZero(data.correct ?? false)
          setReasonZero(data.reason ?? '')
          setResultErrorZero(false)
        })
        .catch(() => {
          setGroundTruthActivityZero('')
          setPredictedActivityZero('')
          setCorrectZero(false)
          setReasonZero('')
          setResultErrorZero(true)
        })
    }
  }, [seed, dataset, visType, windowSize])

  useEffect(() => {
    const datasetKey = datasetKeys[dataset] || datasetKeys[0]
    const origin_desc = desc_map_all[datasetKey]
    const rotated_desc = rotateList(origin_desc, seed)
    const rotated_acts = Object.keys(rotated_desc)
    setRotatedDesc(rotated_desc)
    setRotatedActs(rotated_acts)  

    const rotated_desc_str = rotated_acts
      .map(activity => `\n**${activity}**\n${rotated_desc[activity] || 'N/A'}`)
      .join('\n')

    let context
    if (datasetKey === 'gazebase') {
      context = `Sampling rate: 1000 Hz, Window: ${windowSize}s, Sensor Device: EyeLink 1000, Screen Spec: 1680x1050 px`
    } else if (datasetKey === 'sedentary') {
      context = `Sampling rate: 30 Hz, Window: ${windowSize}s, Sensor Device: Tobii Pro X2-30, Screen Spec: 24-inch`
    } else {
      context = `Sampling rate: 30 Hz, Window: ${windowSize}s, Sensor Device: Pupil Core, Screen Spec: 34-inch`
    }

    const prompt = `Determine the eye-tracking activity class based on the provided data segment.\n\n## Activity Descriptions:\n${rotated_desc_str}\n\n## Data Context:\n${context}`

    const testPrompt = `## Your Task:\nWhen the following eye-tracking data is provided for a task to classify which task it belongs to, what is the most likely answer among [${rotated_acts.join(', ')}]?\n\n**Target Data**`

    setUserPromptText(prompt)
    setTestPromptText(testPrompt)

  }, [seed, dataset])


  return (
    <div className="container">
      <header>
        <h1>Evaluating Visual Prompts with Eye-Tracking Data for MLLM-Based Human Activity Recognition</h1>
        <p className="authors">Jae Young Choi, Seon Gyeom Kim, Hyungjun Yoon, Taeckyung Lee, Donggun Lee, Jaeryung Chung, Jihyung Kil, Ryan Rossi, Sung-Ju Lee, and Tak Yeon Lee</p>
        <p className="venue">PacificVis 2026</p>
        <div className="links">
          <a href="./PacificVis_26-10.pdf" rel="noreferrer" target="_blank">PDF</a>
          <a href="#">arXiv</a>
        </div>
      </header>

      <section className="abstract">
        <div className="teaser-content">
          <img src="./teaser.png" alt="Teaser Image" className="teaser-image" />
          <div className="caption">Figure 1: Overview of the study. We systematically explored visual prompting strategies with eye-tracking data by varying visualization types and prompt parameters (e.g., zero/one-shot and windowing sizes) for MLLM-based human activity recognition.</div>
        </div>
        <div className="abstract-text">Large Language Models (LLMs) have emerged as foundation models for IoT applications such as human activity recognition (HAR). However, directly applying high-frequency and multi-dimensional sensor data, such as eye-tracking data, leads to information loss and high token costs. To mitigate this, we investigate a visual prompting strategy that transforms sensor signals into data visualization images as an input to multimodal LLMs (MLLMs) using eye-tracking data. We conducted a systematic evaluation of MLLM-based HAR across three public eye-tracking datasets using three visualization types of timeline, heatmap, and scanpath, under varying temporal window sizes. Our findings suggest that visual prompting provides a token-efficient and scalable representation for eye-tracking data, highlighting its potential to enable MLLMs to effectively reason over high-frequency sensor signals in IoT contexts.</div>
      </section>

      <section>
      <h2>Research Methodology</h2>
      <div className="experiment-description">
        <img src="./visualization2.png" alt="Visualization Overview" className="teaser-image content-image"/>
        <div className="caption content-caption">Figure 2. Visualizations used in this study. (A) Raw Timeline (B) Feature-based Timeline (C) Absolute Duration Heatmap (D) Fixation Count Heatmap (E) Raw Scanpath (F) Feature-based Scanpath.</div>
        <p>
          This study investigates visual prompting as a training-free strategy for leveraging MLLMs in HAR using eye-tracking data. We focus exclusively on point-based eye-tracking visualizations to reflect general IoT scenarios in which semantic Areas of Interest (AOIs) are not predefined. We systematically design six distinct visualizations grouped into three primary eye-tracking representation types: Timeline, Heatmap, and Scanpath. These visualizations transform high-frequency gaze signals into structured image-based prompts that can be processed by MLLMs without additional model training. Detailed visualization selection rationale and implementation specifications are provided in the paper.
        </p>

        <p>
          To evaluate the generalizability of this approach, we conduct experiments on three public eye-tracking datasets: <i>GazeBase</i>, <i>SedentaryActivity</i>, and <i>DesktopActivity</i>. These datasets contain diverse desktop-based activities collected using either screen-based eye trackers or egocentric wearable devices. Together, they allow us to examine performance across varying activity complexities, class distributions, and recording conditions. A comprehensive summary and the detail of activities of dataset characteristics is available in the paper.
        </p>

        <p>
          All experiments were conducted using the <code>gpt-5.1-2025-11-13</code> via the OpenAI API with default inference settings. The <code>"detail": "high"</code> parameter was applied exclusively to image inputs to ensure high-fidelity visual reasoning.
        </p>
      </div>
    </section>

      <section>
        <h2>Results</h2>
        <div>
          <button className={experiment === 0 ? 'selected' : ''} onClick={() => {setExperiment(0); setWindowSize(10); setDataset(0);setVisType(0); }}>Experiment 1</button>
          <button className={experiment === 1 ? 'selected' : ''} onClick={() => {setExperiment(1); if (dataset === 0) {setDataset(1)}; setVisType(3); }}>Experiment 2</button>
        </div>


        <div className="content">
        {experiment === 0 ? (
          <h3>Experiment 1: Impact of Visualization Techniques</h3>
        ) : (
          <h3>Experiment 2: Impact of Window Size</h3>
        )}

        <div className="experiment-description">
          {experiment === 0 ? (
            <>
            <p>
              In Experiment 1, we systematically evaluate how different visualization techniques influence MLLM-based HAR performance. We compare Timeline, Heatmap, and Scanpath representations under varying temporal window sizes across all three datasets. For each experimental run, one randomly sampled participant from the example pool is used to construct one-shot demonstrations. We generate 30 test cases per activity class for evaluation. To mitigate potential ordering bias in language models, we randomize the order of activity descriptions and example activities for every query. For detailed results and analysis, please refer to the paper.
            </p>
            <div className="caption content-caption">Table 2: HAR accuracy and token consumption across experimental conditions (10s window). <strong className="bold">Bold</strong> indicates best performance per dataset, and <span className="red">red</span> denotes performance below the textual baseline. Multipliers (×↑) show the relative increase in token usage of textual prompts compared to visual prompts.</div>
            <img src="./table2.png" alt="Visualization Overview" className="teaser-image content-image"/>
            </>
          ) : (
            <p>
              In Experiment 2, we examine the effect of temporal window size on classification performance. We conduct additional experiments on the SedentaryActivity and DesktopActivity datasets, varying window lengths from 20 to 100 seconds in 10-second increments. The GazeBase dataset is excluded from this analysis due to its relatively short Fixations segments. These experiments focus exclusively on one-shot settings and include four feature-based representations: Timeline, Heatmap, Scanpath, and feature-text prompting as a baseline. The selection of one-shot examples and the construction of test cases follow the same protocol as in Experiment 1. For detailed results and analysis, please refer to the paper.
              
              <div className="caption content-caption">Figure 4: Comparison of HAR accuracy and token consumption across varying temporal window sizes (10-second to 100-second) for the (A) SedentaryActivity and (B) DesktopActivity datasets. The line plots illustrate the accuracy trends for each visual prompting strategy (Timeline, Heatmap, Scanpath, and the textual baseline). The grouped bar charts represent the corresponding input tokens for each condition.</div>
            <img src="./window2.png" alt="Visualization Overview" className="teaser-image content-image"/>
            </p>
          )}
        </div>

        <div className="content experiment-description interface">
          Below is an interactive interface where you can explore the visual prompts, 
          the corresponding structured prompts, and the model outputs. 
          You can further explore different experimental conditions by switching 
          the dataset, {experiment === 1 && "window size, "}and visualization technique. (Text prompts are not available for this interface due to the large sequence length of data.)
        </div>

          <div className="dataset-selection">
            <button className={dataset === 0 ? 'selected' : ''} disabled={experiment === 1} onClick={() => setDataset(0)}>GazeBase</button>
            <button className={dataset === 1 ? 'selected' : ''} onClick={() => setDataset(1)}>SedentaryActivity</button>
            <button className={dataset === 2 ? 'selected' : ''} onClick={() => setDataset(2)}>DesktopActivity</button>
          </div>

          {experiment !== 0 && (
            <div className="window-selection">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} className={windowSize === (i+1)*10 ? 'selected' : ''} onClick={() => {setWindowSize((i+1)*10); console.log((i+1)*10)}} >
                  {(i+1)*10}s
                </button>
              ))}
            </div>
          )}
          <div className="selection">
              <div className="vis-selection">
                {Array.from({ length: 6 }, (_, i) => (
                  <button
                    key={i}
                    className={`visual-prompt ${visType === i ? 'selected' : ''}`}
                    onClick={() => setVisType(i)}
                    disabled={experiment === 1 && (i == 0 || i == 2 || i == 4)}
                  >
                    {['Timeline (Raw)', 'Timeline (Feature)', 'Heatmap (Raw)', 'Heatmap (Feature)', 'Scanpath (Raw)', 'Scanpath (Feature)'][i]}
                  </button>
                ))}
              </div>
              <div className="seed-selection">
                {/* column headers (seed indices 0..29) */}
                <div className="col-headers">
                  <div className="corner" />
                  {Array.from({ length: 30 }, (_, c) => (
                    <div key={c} className="col-header">{c}</div>
                  ))}
                </div>

                <div className="rows">
                  {(() => {
                    const datasetKey = datasetKeys[dataset] || datasetKeys[0]
                    const activities = Object.keys(desc_map_all[datasetKey] || {})
                    return activities.map((act, r) => {
                      const actFileName = datasetKey === 'gazebase' ? gazebase_map[act] : act
                      return (
                      <div className="row" key={act}>
                        <div className="row-header">
                          {act.split(" ").map((word, index) => (
                            <span key={index} className="word">
                              {word}
                            </span>
                          ))}
                        </div>
                        {Array.from({ length: 30 }, (_, col) => {
                          const i = r * 30 + col
                          const thumbUrl = `https://firebasestorage.googleapis.com/v0/b/eye-tracking-visual-prompt.firebasestorage.app/o/vis${windowSize}%2F${datasetKey}%2F${col}%2Ftest%2F${visTypes[visType]}%2F${actFileName}_250x125.png?alt=media`
                          return (
                            <div
                              key={i}
                              className={`thumbnail ${seed === i ? 'selected' : ''}`}
                              onClick={() => setSeed(i)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter') setSeed(i) }}
                            >
                              <img src={thumbUrl} alt={`Seed ${i}`} />
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                  })()}
                </div>
              </div>
          </div>

          <div className="results-content">
            <div className="prompt left">
              <div className="prompt-content">
                <div className="prompt-label" onClick={() => setSystemPromptCollapsed(c => !c)} style={{cursor: 'pointer', userSelect: 'none'}}>
                  System Prompt {systemPromptCollapsed ? '▶' : '▼'}
                </div>
                <pre>
                  {systemPromptCollapsed
                    ? systemPrompt.split('\n').slice(0, 1).join('\n') + '\n...'
                    : systemPrompt}
                </pre>
                <div className="prompt-label">User Prompt</div>
                <pre>{userPromptText}</pre>
              </div>
            </div>


            <div className="prompt right">
              <div className="prompt-content">
                <div className="prompt-label">‎ </div>
                <div className="aggregated-prompt">
                  <pre className="prompt-pre-inline">{'## Example Data:'}</pre>
                  <div className="example-data-row">
                    {rotatedActs.map((act, i) => {
                      const datasetKey = datasetKeys[dataset] || datasetKeys[0]
                      const sampleIndex = seed % 30
                      const actFileName = datasetKey === 'gazebase' ? gazebase_map[act] : act
                      const exampleUrl = `https://firebasestorage.googleapis.com/v0/b/eye-tracking-visual-prompt.firebasestorage.app/o/vis${windowSize}%2F${datasetKey}%2F${sampleIndex}%2Fexample%2F${visTypes[visType]}%2F${actFileName}.png?alt=media`
                      return (
                      <div key={i} className="example-data-item">
                        <pre className="example-label">**{act}**</pre>
                        <img src={exampleUrl} alt={`Example ${i}`} />
                      </div>
                      )
                    })}
                  </div>
                  <pre className="prompt-pre-inline">{testPromptText}</pre>
                  <div className="target-data">
                    {(() => {
                      const datasetKey = datasetKeys[dataset] || datasetKeys[0]
                      const activities = Object.keys(desc_map_all[datasetKey] || {})
                      const activityIndex = Math.floor(seed / 30)
                      const sampleIndex = seed % 30
                      const activity = activities[activityIndex]
                      const actFileName = datasetKey === 'gazebase' ? gazebase_map[activity] : activity
                      const targetUrl = `https://firebasestorage.googleapis.com/v0/b/eye-tracking-visual-prompt.firebasestorage.app/o/vis${windowSize}%2F${datasetKey}%2F${sampleIndex}%2Ftest%2F${visTypes[visType]}%2F${actFileName}.png?alt=media`
                      return <img src={targetUrl} alt="Target" className="target-image"/>
                    })()}
                  </div>
                </div>
                <div className={`prompt-label`}>Result</div>
                  {
                  <>
                  <div className={`prompt-label shot`}>One-shot (with Example Data)</div>
                  {resultError
                    ? <pre className="result-error">No result found for this combination.</pre>
                    : <pre className={correct ? 'correct' : 'incorrect'}>{`- ground_truth: ${groundTruthActivity}\n- predicted:    ${predictedActivity}\n- correct:      ${correct}\n- reason:       ${reason}`}</pre>
                  }
                  </>
                  }
                  { experiment === 0 &&
                  <>
                  <div className={`prompt-label shot`}>Zero-shot (without Example Data)</div>
                  {resultErrorZero
                    ? <pre className="result-error">No result found for this combination.</pre>
                    : <pre className={correctZero ? 'correct' : 'incorrect'}>{`- ground_truth: ${groundTruthActivityZero}\n- predicted:    ${predictedActivityZero}\n- correct:      ${correctZero}\n- reason:       ${reasonZero}`}</pre>
                  }
                  </>
                  }
              </div>    
            </div>      
          </div>
        </div>
      </section>

      <section>
      <h2>Data Availability</h2>
      <div className="experiment-description">
        <a 
      href="https://drive.google.com/drive/folders/1GQsic1rFl0hB0oKFaTHpqPKHvNeIXdlW?usp=share_link"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download Dataset (Google Drive)
    </a>
      </div>
      </section>

    </div>
  )
}

export default App
