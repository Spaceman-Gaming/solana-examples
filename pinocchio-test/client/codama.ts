import { renderJavaScriptVisitor } from "@codama/renderers";
import { createFromRoot } from 'codama';
import { rootNodeFromAnchorV00} from '@codama/nodes-from-anchor';
import idl from "./idl.json" with { type: "json" }

const codama = createFromRoot(rootNodeFromAnchorV00(idl));

// Generate JavaScript client code
codama.accept(renderJavaScriptVisitor('generated', {
  programAddress: idl.metadata.address,
  programName: idl.name,
}));

console.log('✨ Generated JavaScript client in the "generated" directory');