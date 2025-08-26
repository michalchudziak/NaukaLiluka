import ExpoModulesCore
import WidgetKit
import SwiftUI

public class ReactNativeWidgetExtensionModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ReactNativeWidgetExtension")
        
        Function("reloadWidget") { () in
            WidgetCenter.shared.reloadAllTimelines()
        }
        
        Function("reloadWidgetWithKind") { (kind: String) in
            WidgetCenter.shared.reloadTimelines(ofKind: kind)
        }
        
        Function("updateRoutineState") { (routine1: Bool, routine2: Bool, routine3: Bool, routine4: Bool, routine5: Bool) -> Bool in
            let data = RoutineData(
                routine1: routine1,
                routine2: routine2,
                routine3: routine3,
                routine4: routine4,
                routine5: routine5,
                lastUpdated: Date()
            )
            
            // Save to shared UserDefaults
            guard let userDefaults = UserDefaults(suiteName: "group.com.michalchudziak.NaukaLiluka") else {
                print("Failed to access app group")
                return false
            }
            
            do {
                let encoded = try JSONEncoder().encode(data)
                userDefaults.set(encoded, forKey: "routineData")
                
                // Force synchronization (though deprecated, ensures immediate write)
                let success = userDefaults.synchronize()
                print("UserDefaults synchronize: \(success)")
                
                // Add a small delay to ensure UserDefaults is written before widget reload
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    // Reload all timelines to ensure widget updates
                    WidgetCenter.shared.reloadAllTimelines()
                    print("Widget timelines reloaded")
                }
                
                return true
            } catch {
                print("Failed to encode routine data: \(error)")
                return false
            }
        }
        
        Function("forceRefreshWidget") { () -> [String: Any] in
            guard let userDefaults = UserDefaults(suiteName: "group.com.michalchudziak.NaukaLiluka") else {
                return ["error": "Failed to access app group"]
            }
            
            // Force reload all widget timelines immediately
            WidgetCenter.shared.reloadAllTimelines()
            
            // Read current data to verify
            guard let data = userDefaults.data(forKey: "routineData"),
                  let routineData = try? JSONDecoder().decode(RoutineData.self, from: data) else {
                return ["error": "No data found in UserDefaults"]
            }
            
            return [
                "routine1": routineData.routine1,
                "routine2": routineData.routine2,
                "routine3": routineData.routine3,
                "routine4": routineData.routine4,
                "routine5": routineData.routine5,
                "lastUpdated": routineData.lastUpdated.timeIntervalSince1970,
                "message": "Widget refreshed successfully"
            ]
        }
        
        Function("getRoutineState") { () -> [String: Any] in
            guard let userDefaults = UserDefaults(suiteName: "group.com.michalchudziak.NaukaLiluka"),
                  let data = userDefaults.data(forKey: "routineData"),
                  let routineData = try? JSONDecoder().decode(RoutineData.self, from: data) else {
                return [
                    "routine1": false,
                    "routine2": false,
                    "routine3": false,
                    "routine4": false,
                    "routine5": false
                ]
            }
            
            // Reset if it's a new day
            let calendar = Calendar.current
            if !calendar.isDateInToday(routineData.lastUpdated) {
                return [
                    "routine1": false,
                    "routine2": false,
                    "routine3": false,
                    "routine4": false,
                    "routine5": false
                ]
            }
            
            return [
                "routine1": routineData.routine1,
                "routine2": routineData.routine2,
                "routine3": routineData.routine3,
                "routine4": routineData.routine4,
                "routine5": routineData.routine5
            ]
        }
    }
}

// Shared data model (same as in widget)
struct RoutineData: Codable {
    let routine1: Bool
    let routine2: Bool
    let routine3: Bool
    let routine4: Bool
    let routine5: Bool
    let lastUpdated: Date
}