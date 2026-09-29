import { useEffect, useState, useRef } from 'react';
import { util, ActiveSelection, Group } from 'fabric';
import {
  Copy,
  BringToFront,
  SendToBack,
  Group as GroupIcon,
  Ungroup as UngroupIcon,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';

const ContextMenu = () => {
  const { canvasEditor } = useCanvasContext();
  const [menu, setMenu] = useState({ x: 0, y: 0, object: null }); // Track menu position & target object
  const menuRef = useRef(null);

  useEffect(() => {
    if (!canvasEditor) return;

    const canvasEl = canvasEditor.upperCanvasEl;
    if (!canvasEl) return;

    // Show context menu on right-click
    const handleRightClick = (e) => {
      if (e.button !== 2) return; // Only right-click

      e.preventDefault();
      e.stopPropagation();

      const clickedObject = canvasEditor.findTarget(e, true);
      const activeObjects = canvasEditor.getActiveObjects();

      // Render the menu offscreen to measure its size
      setMenu({ x: -9999, y: -9999, object: clickedObject || null });

      // requestAnimationFrame schedules the callback function to run right before the browser paints the next frame
      requestAnimationFrame(() => {
        if (!menuRef.current) return;

        const menuWidth = menuRef.current.offsetWidth;
        const menuHeight = menuRef.current.offsetHeight;

        // Get the mouse coordinates
        let x = e.clientX;
        let y = e.clientY;

        // Clamp position so menu stays inside viewport
        // 10 is a little padding from the edge
        if (x + menuWidth > window.innerWidth) {
          x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
          y = window.innerHeight - menuHeight - 10;
        }

        if (clickedObject) {
          if (
            activeObjects.length > 1 &&
            activeObjects.includes(clickedObject)
          ) {
            setMenu({ x, y, object: canvasEditor.getActiveObject() });
          } else {
            canvasEditor.setActiveObject(clickedObject);
            setMenu({ x, y, object: clickedObject });
          }
        } else {
          canvasEditor.discardActiveObject();
          setMenu({ x, y, object: null });
        }
      });

      canvasEditor.requestRenderAll();
    };

    // Hide menu on left-click outside
    const handleClickOutside = (e) => {
      if (e.button === 2) return; // ignore right-click
      setMenu({ x: 0, y: 0, object: null });
    };

    canvasEl.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      canvasEl.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [canvasEditor]);

  // Get objects to operate on for group/ungroup logic
  const getSelectedObjects = () => {
    if (!menu.object) return [];
    if (menu.object.type === 'activeSelection' || menu.object.type === 'group')
      return menu.object.getObjects();
    return [menu.object];
  };

  // Duplicate selected objects
  const handleDuplicate = async () => {
    const selectedObjects = canvasEditor.getActiveObjects();
    if (!selectedObjects.length) return;

    const clones = [];

    for (const obj of selectedObjects) {
      if (obj.type === 'group') {
        const groupClone = await util.enlivenObjects([obj.toObject()]);
        groupClone[0].set({
          left: obj.left + 20,
          top: obj.top + 20,
          selectable: true,
          evented: true,
          opacity: obj.opacity,
        });
        canvasEditor.add(groupClone[0]);
        groupClone[0].setCoords();
        clones.push(groupClone[0]);
      } else {
        const [clone] = await util.enlivenObjects([obj.toObject()]);
        clone.set({
          left: obj.left + 20,
          top: obj.top + 20,
          selectable: true,
          evented: true,
          opacity: obj.opacity,
        });
        canvasEditor.add(clone);
        clone.setCoords();
        clones.push(clone);
      }
    }

    // If multiple objects, create a selection
    if (clones.length > 1) {
      const selection = new ActiveSelection(clones, { canvas: canvasEditor });
      canvasEditor.setActiveObject(selection);
    } else {
      canvasEditor.setActiveObject(clones[0]);
    }

    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Delete selected objects
  const handleDelete = () => {
    const selectedObjects = canvasEditor.getActiveObjects();
    if (!selectedObjects.length) return;

    // Flatten selection to individual objects
    const flatten = (objs) =>
      objs.flatMap((o) => {
        if (o.type === 'group' || o.type === 'activeSelection') {
          return [...o.getObjects(), o]; // include the group itself
        }
        return [o];
      });

    const objectsToDelete = flatten(selectedObjects);

    objectsToDelete.forEach((obj) => canvasEditor.remove(obj));

    // Clear active selection
    canvasEditor.discardActiveObject();
    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Bring selected objects to front
  const handleBringToFront = () => {
    const selectedObjects = canvasEditor.getActiveObjects();
    if (!selectedObjects.length) return;

    // Flatten selection but also include the groups themselves
    const flatten = (objs) =>
      objs.flatMap((o) => {
        if (o.type === 'group' || o.type === 'activeSelection') {
          return [...o.getObjects(), o]; // children + group
        }
        return [o];
      });

    const objectsToBring = flatten(selectedObjects);

    // Bring each object (and group) to front
    objectsToBring.forEach((obj) => canvasEditor.bringObjectToFront(obj));

    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Send selected objects to back
  const handleSendToBack = () => {
    const selectedObjects = canvasEditor.getActiveObjects();
    if (!selectedObjects.length) return;

    // Flatten selection but also include the groups themselves
    const flatten = (objs) =>
      objs.flatMap((o) => {
        if (o.type === 'group' || o.type === 'activeSelection') {
          return [...o.getObjects(), o]; // children + group itself
        }
        return [o];
      });

    const objectsToSend = flatten(selectedObjects);

    // Send each object (and group) to back
    objectsToSend.forEach((obj) => canvasEditor.sendObjectToBack(obj));

    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Toggle lock/unlock for objects
  const handleToggleLock = () => {
    const selectedObjects = canvasEditor.getActiveObjects();
    if (!selectedObjects.length) return;

    selectedObjects.forEach((obj) => {
      const locked = obj.selectable === false;
      obj.selectable = locked ? true : false;
      obj.evented = true; // keep right-click and hover working

      if (obj.type === 'group' || obj.type === 'activeSelection') {
        obj.getObjects().forEach((child) => {
          child.selectable = obj.selectable;
          child.evented = true;
        });
      }

      obj.setCoords();
    });

    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Group selected objects
  const handleGroup = () => {
    const selection = canvasEditor.getActiveObjects();
    if (selection.length < 2) return;

    selection.forEach((obj) => canvasEditor.remove(obj));

    const group = new Group(selection, { canvas: canvasEditor });
    canvasEditor.add(group);
    canvasEditor.setActiveObject(group);
    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Ungroup a group object
  const handleUngroup = () => {
    const group = menu.object;
    if (!group || group.type !== 'group') return;

    const children = group.removeAll(); // removes from group and returns children

    // Remove group from canvas
    canvasEditor.remove(group);

    // Add children back to canvas
    children.forEach((child) => {
      canvasEditor.add(child);
      child.setCoords(); // ensures selection works
      child.selectable = true;
      child.evented = true;
      child.visible = true;
    });

    // Clear previous selection
    canvasEditor.discardActiveObject();

    // If multiple children, create a new ActiveSelection
    if (children.length > 1) {
      const selection = new ActiveSelection(children, { canvas: canvasEditor });
      canvasEditor.setActiveObject(selection);
    } else if (children.length === 1) {
      canvasEditor.setActiveObject(children[0]);
    }

    canvasEditor.requestRenderAll();
    setMenu({ x: 0, y: 0, object: null });
  };

  // Render buttons for the context menu
  const renderButtons = (buttons) =>
    buttons.map(({ label, icon, action }) => (
      <button
        key={label}
        className='flex items-center px-3 py-2 text-[var(--primary-color)] hover:text-[var(--secondary-color)]'
        onClick={action}
      >
        {icon}
        <span className='block ml-2'>{label}</span>
      </button>
    ));

  if (!menu.object) return null;

  const selectedObjects = getSelectedObjects();

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: '140px',
        padding: '4px 0',
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {renderButtons([
        {
          icon: <Copy size={18} />,
          label: 'Duplicate',
          action: handleDuplicate,
        },
        {
          icon: <BringToFront size={18} />,
          label: 'Bring to Front',
          action: handleBringToFront,
        },
        {
          icon: <SendToBack size={18} />,
          label: 'Send to Back',
          action: handleSendToBack,
        },
        {
          icon:
            selectedObjects.length > 1 ? (
              <UngroupIcon size={18} />
            ) : (
              <GroupIcon size={18} />
            ),
          label: menu.object.type === 'group' ? 'Ungroup' : 'Group',
          action: menu.object.type === 'group' ? handleUngroup : handleGroup,
        },
        {
          icon: selectedObjects.every((o) => o.selectable === false) ? (
            <Unlock size={18} />
          ) : (
            <Lock size={18} />
          ),
          label: selectedObjects.every((o) => o.selectable === false)
            ? 'Unlock'
            : 'Lock',
          action: handleToggleLock,
        },
        { icon: <Trash2 size={18} />, label: 'Delete', action: handleDelete },
      ])}
    </div>
  );
};

export default ContextMenu;
