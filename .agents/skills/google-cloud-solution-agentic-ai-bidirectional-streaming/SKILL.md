---
name: google-cloud-solution-agentic-ai-bidirectional-streaming
description: >-
  Guides agents to interactively discover customer requirements for live,
  bidirectional multi-agent AI systems that process continuous streams of
  multimodal data for real-time technical guidance and safety monitoring.
  Generates a custom Google Cloud solution that uses opinionated best practices
  and architecture guidance. Use when users need agentic assistance to
  design and create a multi-product solution in the cloud for live
  bidirectional multimodal streaming workloads.
---

# Live bidirectional multimodal streaming agentic AI solution

This skill guides agents through the workflow to design and implement a
tailored multi-product solution in the cloud for a live, bidirectional
multimodal streaming workload, use case, or requirement.

## Workflow

The solution design and implementation workflow consists of the following
phases:

*   **Phase 1: Requirements discovery and analysis**: Analyze the workload's
    requirements, constraints, dependencies, and current state.
*   **Phase 2: Solution design**: Build a technology stack, architecture, and
    deployment configuration for the workload based on Google Cloud design best
    practices and recommendations.
*   **Phase 3: Implementation plan**: Generate automation and instructions to
    deploy the solution.
*   **Phase 4: Solution validation**: Validate that the deployment meets the
    requirements of the workload.

## Supporting links

Use these references to answer user questions that might deviate from the
workflow phases.

*   **Architecture guides**:
    *   [Enable live bidirectional multimodal streaming](https://docs.cloud.google.com/architecture/agentic-ai-bidirectional-multimodal-streaming.md.txt)
    *   [Choose your agentic AI architecture components](https://docs.cloud.google.com/architecture/choose-agentic-ai-architecture-components.md.txt)
    *   [Multi-agent AI system in Google Cloud](https://docs.cloud.google.com/architecture/multiagent-ai-system.md.txt)
    *   [Choose a design pattern for your agentic AI system](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system.md.txt)
    *   [Multi-agent private networking patterns in Google Cloud](https://docs.cloud.google.com/architecture/multi-agent-private-networking-patterns.md.txt)
*   **Implementation guides**:
    *   [Host AI agents on Cloud Run](https://docs.cloud.google.com/run/docs/ai-agents)
    *   [Triggering Cloud Run with WebSockets](https://docs.cloud.google.com/run/docs/triggering/websockets)
    *   [Start and Manage a Gemini Live API Session](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api/start-manage-session)
    *   [ADK Streaming Tools](https://adk.dev/streaming/streaming-tools/)
    *   [ADK Streaming Configuration](https://adk.dev/streaming/configuration/)
    *   [Codelab: Way Back Home Level 4 instructions](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)
        (and [solution code](https://github.com/gca-americas/way-back-home/tree/main/level_4))

### Phase 1: Requirements discovery and analysis

1.  **Discover requirements**: Understand the functional and non-functional
    requirements, business goals, and current state (if any) of the workload,
    including its architecture, dependencies, and constraints. Use the following
    questions to guide the requirements discovery process:

    -   What are the primary input modalities (audio, video, or text) and
        what is the target latency for real-time, narrated feedback?
    -   Do you require real-time safety monitoring, hazard detection, or visual
        inspection? If so, then what specific safety hazards, operational risks,
        or incorrect steps need to be monitored and detected in the video
        stream?
    -   What existing systems, knowledge bases, product documentation, or
        schematic repositories must the AI agents access for grounded guidance?
    -   What are the client-side device constraints and network limitations?

2.  **Identify components**: Based on the requirements analysis, identify the
    components of the workload and their relationships. Also identify any
    cross-cloud components, hybrid components, or on-prem components that the
    solution needs to integrate with.

3.  **Generate component decomposition**: Generate a technical decomposition of
    the components of the workload.

4.  **Ask for confirmation**: Ask the user to confirm whether the generated
    technical decomposition matches their workload requirements.

5.  **Iterate**: If the user requests changes, then generate an updated
    technical decomposition, and ask the user to confirm the changes. Continue
    iterating until the user confirms the technical decomposition.

### Phase 2: Solution design

1.  **Retrieve relevant Google Cloud documentation**:

    -   [Enable live bidirectional multimodal streaming](https://docs.cloud.google.com/architecture/agentic-ai-bidirectional-multimodal-streaming.md.txt)
    -   [Multi-agent AI system in Google Cloud](https://docs.cloud.google.com/architecture/multiagent-ai-system.md.txt)
    -   [Choose your agentic AI architecture components](https://docs.cloud.google.com/architecture/choose-agentic-ai-architecture-components.md.txt)
    -   [Multi-agent private networking patterns in Google Cloud](https://docs.cloud.google.com/architecture/multi-agent-private-networking-patterns.md.txt)

    *Important*: Use the content that you retrieve from Google Cloud
      documentation to ground the guidance that you generate in the remaining
      steps of this phase.

2.  **Map components to Google Cloud products**:
    - Cloud Run networking:
      - Recommended primary configuration: Regional External Application Load
        Balancer combined with Cloud Armor for HTTP/HTTPS/WebSocket
        ingress, and Direct VPC egress for Cloud Run private network
        access.
      - Alternative product 1: Global External Application Load Balancer
        - Pros: Single anycast IP, global IPv6 termination, and low-latency
          routes to globally distributed backend services.
        - Cons: Terminates TLS globally at edge locations, which might not
          comply with strict regional data residency regulations.
      - Alternative product 2: Internal Application Load Balancer
        - Pros: Securely exposes Cloud Run services internally within the VPC
          to meet internal ingress criteria, terminates TLS with trusted
          certificates, and supports Cloud Armor backend security policies.
        - Cons: Requires that you configure serverless network endpoint groups
          (NEGs) as backends and manage load balancer resources.
      - Alternative product 3: Private Service Connect interface
        - Pros: Secure private VPC connections for Gemini Enterprise Agent
          Runtime that uses network attachments.
        - Cons: Limited to RFC 1918 routable subnet ranges, requires proxy
          setup for non-routable/internet destinations.
    - Frontend:
      - Recommended primary product: Cloud Run
      - Alternative product 1: Firebase App Hosting
        - Pros: Automated builds and deployment pipeline from GitHub, optimized
          for modern framework integrations.
        - Cons: Less control over container configurations, limits
          customization of low-level networking.
      - Alternative product 2: Google Kubernetes Engine (GKE)
        - Pros: Maximum control over routing, scaling, and custom container
          runtimes.
        - Cons: Significant infrastructure management complexity and cost
          overhead.
    - Agent development framework:
      - Recommended primary product: Agent Development Kit (ADK).
    - Agent-to-agent communication:
      - Recommended primary product: Agent2Agent (A2A) protocol.
    - Runtime for your agent:
      - Recommended primary product: Cloud Run
      - Alternative product 1: Gemini Enterprise Agent Runtime
        - Pros: Fully managed Python runtime, built-in memory/sessions,
          secure code execution sandbox.
        - Cons: Limited to Python, does not support hosting custom MCP
          servers, less control over container environment.
      - Alternative product 2: Google Kubernetes Engine (GKE)
        - Pros: Maximum infrastructure control, stateful pods, custom
          scaling.
        - Cons: High operational complexity and overhead.
    - Model runtime:
      - Recommended primary product: Gemini Enterprise Agent Platform
      - Alternative product 1: Cloud Run
        - Pros: Serverless hosting for containerized open/custom models like
          Gemma.
        - Cons: Cannot serve Google Gemini models, manual
          instance scaling overhead.
      - Alternative product 2: Google Kubernetes Engine (GKE)
        - Pros: Maximum control over inference server on GPU/TPU nodes,
          cheap for predictable high volume.
        - Cons: Cannot run Google Gemini models, high cluster management
          overhead.
    - Model selection:
      - Recommended primary product: Gemini Flash with Gemini Live API
      - Alternative product 1: Gemini Pro
        - Pros: Highest capability for reasoning, complex instructions, context
          tracking, and multi-agent coordination.
        - Cons: Higher request cost and latency, which makes it less suitable
          for real-time conversational requirements.
    - VPC connection to the database: The architect agent sends queries
      through this connector to securely access resources in the Virtual
      Private Cloud (VPC) network used for storage resources in this
      architecture.
      - Recommended primary product: Serverless VPC Access connector.
      - Alternative product 1: Direct VPC egress
        - Pros: Lower latency, lower resource cost, and avoids throughput
          scaling bottlenecks.
        - Cons: Requires specific routing and subnet configurations.
    - Caching:
      - Recommended primary product: Memorystore for Redis Cluster
    - Database:
      - Recommended primary product: [Google Cloud Databases](https://cloud.google.com/products/databases)
        Use the recommendations listed on this page to help the user choose
        the appropriate database option.
      - Alternative product 1: Compute Engine (for self-hosted databases)
        - Pros: Full control over database configurations, OS accessibility, and
          custom database engines or extensions.
        - Cons: High operational overhead to manually manage backups, patching,
          scaling, and high availability.
3.  **Create architecture diagram**: Create an architecture diagram that shows
    the components, their relationships, and data and control flows.

    -   The diagram must be in the Mermaid format:
        https://github.com/mermaid-js/mermaid.
    -   The diagram must use Google-approved icons based on the guidance in
        https://services.google.com/fh/files/misc/google-cloud-product-icons.pdf.

4.  **Generate design recommendations**: Generate design guidance based on the
    following Google Cloud best practices and recommendations:
    - **Security, privacy, and compliance**:
      - To limit access to the app, disable the default run.app URL of the
        frontend Cloud Run service and configure a regional external
        Application Load Balancer with Cloud Armor security policies to handle
        request filtering, rate limiting, and DDoS protection.
      - Enforce the principle of least privilege when you configure IAM
        permissions for resources in the topology.
      - To protect sensitive multimodal data (such as voice prints and video),
        enforce TLS encryption for all bidirectional WebSocket connections.
      - Secure Agent2Agent (A2A) communication using authenticated extended
        agent cards, and attach OpenID Connect (OIDC) identity tokens to let
        IAM validate that only authorized agents access the data.
      - Incorporate human-in-the-loop flows to let supervisors monitor, pause,
        and override business-critical agent actions.
      - For more information about security considerations, see
        https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/security.md.txt
    - **Reliability**:
      - Build fault-tolerant agents employing decentralized designs where agents
        can operate independently to survive failures.
      - Simulate inter-agent coordination issues and unexpected behaviors in a
        replica staging environment before deploying to production.
      - Leverage regional multi-zone deployment of Cloud Run to automatically
        load-balance and survive zone outages.
      - Plan model capacity by monitoring standard quota rates, using
        Provisioned Throughput for business-critical production workloads.
      - For more information about reliability considerations, see
        https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/reliability.md.txt
    - **Operational excellence**:
      - Route agent logs to Cloud Logging in structured formats, integrating
        standard stdout/stderr streams.
      - Track complete agent workflows, reasoning loops, and execution paths
        using Cloud Trace and trace visualizers.
      - Perform continuous evaluation using tools like Agent Evaluation on
        Gemini Enterprise Agent Platform or ADK evaluation methodologies.
      - Centralize database tools and connection scaling policies using the MCP
        Database Toolbox.
      - For more information about operational excellence considerations,
        see
        https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/operational-excellence.md.txt
    - **Cost optimization**:
      - Reduce data ingestion costs by employing low-frequency frame sampling
        and compressing video to Base64 JPEGs.
      - Use context caching for requests containing long system prompts or
        static lookup databases to reduce input token costs.
      - Structure prompts to get concise responses to minimize generation token outputs.
      - Start with the most smaller and cost-efficient models. Upgrade to more
        powerful models with reasoning based on performance requirements.
      - For more information about cost optimization considerations, see
        https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/cost-optimization.md.txt
    - **Performance efficiency**:
      - Decouple incoming audio and video packets from the model's inference
        engine. Use a thread-safe, asynchronous First-In-First-Out (FIFO)
        buffer to keep the user interface responsive to interruptions.
      - To achieve sub-millisecond read speeds and prevent silences during
        real-time voice interactions, deploy an in-memory Memorystore for Redis
        Cluster database for the agent's schematic vault.
      - To optimize service performance, configure memory limits and CPU
        limits allocated to the Cloud Run instances based on live workloads.
      - For more information about performance considerations, see
        https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/performance-optimization.md.txt.
    - **Sustainability**:
      - Route simpler tasks to small language models (SLMs) and optimize model
        routing to minimize total model inference footprint.
      - To prevent wasting resource baseline energy, use Cloud Run native
        autoscaling to scale compute runtimes down to zero during idle periods.
      - For more information about sustainability considerations, see
      https://docs.cloud.google.com/architecture/framework/sustainability/printable.md.txt.

5.  **Draft solution architecture**: Compile the requirements, technical
    decomposition, product mapping, architecture diagram, and design
    recommendations into a single Markdown file.

6.  **Request review**: Present the generated solution architecture to the user
    and request their feedback or approval.

7.  **Iterate**: If the user requests changes, generate an updated solution
    architecture and repeat steps 5-6 until the user approves the solution
    architecture.

### Phase 3: Implementation plan

1.  **Retrieve relevant implementation resources**:

    -   [Host AI agents on Cloud Run](https://docs.cloud.google.com/run/docs/ai-agents.md.txt)
    -   [Triggering Cloud Run with WebSockets](https://docs.cloud.google.com/run/docs/triggering/websockets.md.txt)
    -   [Start and Manage a Gemini Live API Session](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api/start-manage-session.md.txt)
    -   [ADK Streaming Tools](https://adk.dev/streaming/streaming-tools/)
    -   [ADK Streaming Configuration](https://adk.dev/streaming/configuration/)
    -   [Codelab: Way Back Home Level 4 instructions](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)
        (and
        [solution code](https://github.com/gca-americas/way-back-home/tree/main/level_4))

    *Important*: Use these resources as the technical foundation for the IaC and
    deployment instructions you generate in the remaining steps of this phase.

2.  **Identify deployment prerequisites**: Document prerequisites for the
    deployment, including the following:

    -   Projects and billing associations
    -   Required Google Cloud APIs
    -   Required IAM permissions
    -   Any other prerequisites

3.  **Generate Infrastructure as Code (IaC)**: Generate code, like Terraform,
    and deployment scripts to automate the provisioning of the proposed Google
    Cloud resources.

4.  **Write deployment instructions**: Draft sequential, step-by-step deployment
    instructions to execute the IaC and initialize the workload components.

5.  **Request review**: Present the generated deployment instructions to the
    user for feedback and confirmation.

6.  **Iterate**: If the user requests changes, then generate an updated
    implementation plan and repeat steps 4-5 until the user approves the
    implementation plan.

### Phase 4: Solution validation

1.  **Retrieve relevant verification resources**:

    -   [Host AI agents on Cloud Run](https://docs.cloud.google.com/run/docs/ai-agents.md.txt)
    -   [Triggering Cloud Run with WebSockets](https://docs.cloud.google.com/run/docs/triggering/websockets.md.txt)
    -   [Start and Manage a Gemini Live API Session](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api/start-manage-session.md.txt)
    -   [ADK Streaming Tools](https://adk.dev/streaming/streaming-tools/)
    -   [ADK Streaming Configuration](https://adk.dev/streaming/configuration/)
    -   [Codelab: Way Back Home Level 4 instructions](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)
        (and
        [solution code](https://github.com/gca-americas/way-back-home/tree/main/level_4))

    *Important*: Use these resources and their verification patterns as the
    starting point for the validation checks and verification scripts that you
    generate in the remaining steps of this phase.

2.  **Define validation checks**: Outline validation steps to verify that the
    deployed infrastructure meets the workload's requirements:

    -   **Deployment dry-run**: Commands like `terraform plan` to preview
        changes.
    -   **Connectivity and routing**: Verification of network paths, load
        balancer routing, and service endpoints.
    -   **Security policies**: Verification of restricted access, firewall
        rules, and IAM enforcement.

3.  **Generate verification scripts**: Draft lightweight scripts or command-line
    instructions, such as using `curl` or `gcloud`, that the user can run to
    perform these validation checks.

4.  **Compile validation report**: Document the validation steps, verification
    scripts, and expected outcomes in a single Markdown file.

5.  **Conduct validation and finalize**: Assist the user in executing the
    validation checks and troubleshooting any deployment issues. After the
    solution is validated successfully, request final approval from the user.

6.  **Iterate**: If the user requests changes, then generate an updated
    validation plan and repeat steps 4-5 until the user approves the validation
    plan.
