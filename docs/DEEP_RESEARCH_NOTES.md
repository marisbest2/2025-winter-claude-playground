# Deep Research Agent Notes

Research notes on deep research agent architectures and patterns. These inform our Government Records Deep Research Agent implementation.

---

## Reference Implementations

### 1. LangChain Open Deep Research

**Repo**: https://github.com/langchain-ai/open_deep_research

**Architecture**:

- Planning phase: Creates research plan with sections
- Research phase: Iteratively researches each section with web search
- Writing phase: Synthesizes findings into coherent report

**Key Patterns**:

- Uses LangGraph for workflow orchestration
- Separates planning, research, and synthesis into distinct nodes
- Supports human-in-the-loop for plan approval
- Parallelizes research across sections

**Takeaways for Us**:

- [ ] Consider letting users approve research plan before execution
- [ ] Parallelize research across different data sources (meetings, documents, transcripts)
- [ ] Separate query decomposition from retrieval from synthesis

---

### 2. GPT Researcher

**Repo**: https://github.com/assafelovic/gpt-researcher

**Architecture**:

```
User Query
    ↓
Task Planning (generate sub-questions)
    ↓
Agent Per Sub-Question (parallel)
    ↓
Scrape + Summarize Sources
    ↓
Final Report Generation
```

**Key Patterns**:

- Spawns separate "agents" for each sub-question
- Each agent does its own web search and summarization
- Aggregates all findings for final synthesis
- Supports different report types (research, outline, detailed)

**Takeaways for Us**:

- [ ] Decompose complex questions into sub-questions
- [ ] Each sub-question can target different data sources
- [ ] Support different output formats (summary, detailed report, timeline)

---

### 3. dzhng/deep-research

**Repo**: https://github.com/dzhng/deep-research

**Architecture**:

- Iterative deepening: starts broad, then drills down
- Uses breadth-first then depth-first search pattern
- Tracks "research frontier" of unexplored questions

**Key Patterns**:

- Maintains a priority queue of research questions
- Scores questions by relevance and unexplored-ness
- Stops when confidence threshold reached or budget exhausted
- Cites sources inline as it writes

**Takeaways for Us**:

- [ ] Track what we've explored vs what's unexplored
- [ ] Allow iterative deepening (user asks follow-up, we go deeper)
- [ ] Confidence scoring for answers
- [ ] Inline citations with source links

---

### 4. SkyworkAI DeepResearchAgent

**Repo**: https://github.com/SkyworkAI/DeepResearchAgent

**Architecture**:

- Multi-agent with specialized roles
- Planner, Researcher, Writer, Reviewer agents
- Shared memory/context between agents

**Key Patterns**:

- Reviewer agent critiques and requests revisions
- Explicit "reflection" step after each research phase
- Uses RAG for long-context documents

**Takeaways for Us**:

- [ ] Consider a "verification" step that cross-checks sources
- [ ] Reflection: "What contradictions did I find? What's still unclear?"
- [ ] For meeting transcripts, RAG with timestamps

---

### 5. QX-Labs agents-deep-research

**Repo**: https://github.com/QX-Labs/agents-deep-research

**Key Patterns**:

- Lightweight implementation focused on simplicity
- Single orchestrator with tool calls
- Emphasis on source attribution

**Takeaways for Us**:

- [ ] Start simple, add complexity as needed
- [ ] Source attribution is non-negotiable

---

### 6. Together AI Open Deep Research

**Blog**: https://www.together.ai/blog/open-deep-research

**Key Insights**:

- Uses open-source models effectively
- Emphasizes cost/latency tradeoffs
- Parallel tool calls for speed

**Takeaways for Us**:

- [ ] Consider model selection per task (fast model for planning, capable model for synthesis)
- [ ] Batch API calls where possible

---

### 7. Building Deep Research Agent Using MCP-Agent

**Tutorial focus**: MCP (Model Context Protocol) integration

**Key Patterns**:

- MCP servers provide domain-specific tools
- Agent orchestrates across multiple MCP servers
- Clean separation between agent logic and data access

**Takeaways for Us**:

- [ ] Our Government Records MCP is the right abstraction
- [ ] Agent doesn't need to know about IQM2 vs Granicus
- [ ] MCP tools should return structured data with source metadata

---

## Common Patterns Across Implementations

### 1. Query Decomposition

All implementations break complex queries into sub-questions:

- "What happened with the Main St development?" becomes:
  - "Which board handles Main St development?"
  - "What meetings discussed it?"
  - "What was decided?"
  - "What's the current status?"

### 2. Planning Phase

Most have an explicit planning step before research:

- Generate research plan
- Optionally get user approval
- Execute plan systematically

### 3. Source Attribution

Every implementation emphasizes citations:

- Inline citations `[Source 1]`
- Links to original documents
- Timestamps for video content

### 4. Synthesis, Not Just Retrieval

The "deep" in deep research = synthesis:

- Don't just return documents
- Answer the question directly
- Note contradictions between sources
- Acknowledge uncertainty

### 5. Iterative Refinement

Support for drilling deeper:

- Follow-up questions refine the search
- Track conversation context
- Build on previous findings

---

## Patterns Specific to Government Records

### Contradiction Handling

Government sources often contradict:

- Agenda says one thing, minutes say another
- Video reveals context not in documents
- Our agent should HIGHLIGHT these contradictions

### Temporal Awareness

Government decisions evolve:

- "What's the current status?" requires finding the LATEST info
- Track chronology of decisions
- Show timeline when helpful

### Jurisdiction Awareness

Users think hierarchically:

- "Did the county approve this?" (different from municipal)
- "What did the BOE say?" (different governing body)
- Cross-jurisdiction queries are powerful

### Document Types

Each has different reliability/completeness:
| Type | Reliability | Completeness |
|------|-------------|--------------|
| Agenda | Official | Forward-looking, may change |
| Minutes | Official | Summary, may omit details |
| Video/Transcript | Primary | Complete but unstructured |
| News | Secondary | Interpretive, may be biased |

---

## Architecture Decisions for Our Agent

Based on this research:

### Phase 1: Simple Orchestrator

```
User Query → Mastra Agent → MCP Tools → Synthesis → Response
```

- Single agent with tool access
- No explicit planning phase yet
- Focus on getting MCP tools right

### Phase 2: Add Planning

```
User Query → Plan Generation → [User Approval?] → Research Execution → Synthesis
```

- Explicit planning step
- Optional user approval for complex queries
- Better handling of multi-part questions

### Phase 3: Multi-Agent (if needed)

```
Coordinator → [Researcher, Verifier, Writer]
```

- Only add complexity if Phase 2 is insufficient
- Verification agent for contradiction detection
- Writer agent for report generation

---

## Open Questions

1. **How deep is deep?** When do we stop researching and start synthesizing?
2. **User approval for plans?** Adds latency but increases trust
3. **Caching strategy?** Cache at query level? Document level? Both?
4. **Streaming?** Show research progress in real-time?

---

## Next Steps

1. Implement basic Mastra agent with MCP tools (Milestone 2B)
2. Test with real queries, identify gaps
3. Add planning phase if queries are too shallow
4. Add verification if contradictions are missed
