# Connection System Test

## Quick Test Steps

1. **Open the Builder**: Navigate to the builder page
2. **Add Nodes**: Click on components in the sidebar to add 2-3 nodes
3. **Check Debug Panel**: Look at the top-left debug panel - it should show:
   - Mouse Mode: idle
   - Can Connect: ✓ (green checkmark)
   - Can Drag Nodes: ✓ (green checkmark)

4. **Test Connection Creation**:
   - Click on a **purple circle** (OUTPUT handle) on the right side of any node
   - Debug panel should show "creating-connection" mode
   - Move mouse around - you should see a line following your cursor
   - Click on a **blue circle** (INPUT handle) on the left side of another node
   - A permanent connection line should appear

5. **Test Connection Deletion**:
   - Click directly on any connection line
   - The connection should disappear

## What to Look For

### ✅ **Working Correctly:**
- Large, visible connection handles (blue left, purple right)
- Debug panel shows correct interaction states
- Connection line follows mouse during creation
- Permanent connection appears after completing
- Console logs show connection events

### ❌ **Not Working:**
- Handles are too small or invisible
- Debug panel shows "Can Connect: ✗"
- No line follows mouse when dragging
- Connections don't appear after clicking handles
- Console shows errors

## Troubleshooting

### If Connections Don't Work:
1. **Check Console**: Look for JavaScript errors
2. **Check Debug Panel**: Ensure "Can Connect" shows ✓
3. **Try Different Browsers**: Test in Chrome/Firefox
4. **Refresh Page**: Clear any stuck state
5. **Check Handle Visibility**: Ensure purple/blue circles are visible

### Common Issues:
- **Handles Too Small**: Should be clearly visible circles
- **Event Conflicts**: Debug panel will show interaction conflicts
- **State Issues**: Refresh page to reset state
- **Browser Issues**: Try different browser or incognito mode

## Expected Console Output

When working correctly, you should see:
```
SimpleConnectionHandler: Starting connection {nodeId: "...", handleType: "output", position: {...}}
SimpleConnectionHandler: Completing connection {source: "...", target: "...", ...}
SimpleConnectionHandler: Connection created {id: "...", source: "...", target: "..."}
```

## Success Criteria

✅ **System is working if:**
- You can create connections by clicking purple → blue handles
- Connection lines appear and persist
- Debug panel shows correct states
- Console logs show connection events
- Connections can be deleted by clicking on them

The simplified connection system should now work reliably for manual connections!