# WireText Guidance

WireText is for low-fidelity wireframes and structural UI exploration.

Use it when:

- a user asks for wireframes
- a feature needs layout exploration before implementation
- you want to compare multiple structural directions quickly

Do not use it for:

- rendered-page verification
- responsive QA
- pixel-perfect design review
- replacing Figma when a real design file exists

## Priority

For UI workflows, prefer:

1. WireText MCP for wireframes, if available
2. ASCII wireframes in docs when WireText is unavailable
3. Chrome MCP or `agent-browser` later for rendered verification
4. Figma MCP when an actual design file exists

## Expected Outputs

When using WireText, preserve enough context for downstream work:

- editable WireText URL, if the server returns one
- exported text wireframe, if available
- a short note in the design/spec doc explaining what the wireframe covers

If the workflow creates assets, store exported artifacts under:

- `docs/arc/specs/assets/YYYY-MM-DD-topic/`

and reference them from the design doc.

## Hand-off Rule

WireText defines structure:

- page sections
- block hierarchy
- key interaction points
- rough layout relationships

It does not define visual fidelity. After wireframing:

- use design docs and interface rules for aesthetic direction
- use Chrome MCP or `agent-browser` for rendered-page review
- use Figma MCP if an exact design source exists
