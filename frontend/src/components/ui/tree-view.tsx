import { TreeView as ChakraTreeView } from "@chakra-ui/react"
import * as React from "react"
import { LuFile, LuFolder, LuFolderOpen } from "react-icons/lu"

export interface TreeViewRootProps
  extends ChakraTreeView.RootProps {}

export const TreeViewRoot = React.forwardRef<HTMLDivElement, TreeViewRootProps>(
  function TreeViewRoot(props, ref) {
    return <ChakraTreeView.Root ref={ref} {...props} />
  },
)

export const TreeViewTree = ChakraTreeView.Tree
export const TreeViewLabel = ChakraTreeView.Label
export const TreeViewItemText = ChakraTreeView.ItemText
export const TreeViewBranchText = ChakraTreeView.BranchText
export const TreeViewBranchIndentGuide = ChakraTreeView.BranchIndentGuide
export const TreeViewBranchControl = ChakraTreeView.BranchControl
export const TreeViewBranchIndicator = ChakraTreeView.BranchIndicator // Standard chevron
export const TreeViewItemIndicator = ChakraTreeView.ItemIndicator

export const TreeViewNode = ChakraTreeView.Node
export const TreeViewItem = ChakraTreeView.Item

export interface TreeViewFolderIconProps {
  isOpen?: boolean
}

export const TreeViewFolderIcon = (props: TreeViewFolderIconProps) => {
  return props.isOpen ? <LuFolderOpen /> : <LuFolder />
}

export const TreeViewFileIcon = () => {
    return <LuFile />
}
