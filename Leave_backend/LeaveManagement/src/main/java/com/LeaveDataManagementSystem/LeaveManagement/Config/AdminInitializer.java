package com.LeaveDataManagementSystem.LeaveManagement.Config;

import com.LeaveDataManagementSystem.LeaveManagement.Model.User;
import com.LeaveDataManagementSystem.LeaveManagement.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Value("${admin.emails:}")
    private String adminEmailsStr;

    @Value("${admin.passwords:}")
    private String adminPasswordsStr;

    @Value("${admin.names:}")
    private String adminNamesStr;

    @Override
    public void run(String... args) throws Exception {
        if (adminEmailsStr.isEmpty()) {
            System.out.println("⚠ No admin users configured");
            return;
        }

        // Parse comma-separated values
        List<String> adminEmails = Arrays.stream(adminEmailsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        List<String> adminPasswords = Arrays.stream(adminPasswordsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        List<String> adminNames = adminNamesStr.isEmpty() ?
                List.of() :
                Arrays.stream(adminNamesStr.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());

        if (adminEmails.size() != adminPasswords.size()) {
            System.err.println("❌ Admin emails and passwords count mismatch!");
            System.err.println("Emails count: " + adminEmails.size());
            System.err.println("Passwords count: " + adminPasswords.size());
            return;
        }

        // Get all existing admins
        List<User> allUsers = userRepository.findAll();
        List<String> existingAdminEmails = allUsers.stream()
                .filter(user -> user.getRoles() != null && user.getRoles().contains("ADMIN"))
                .map(User::getEmail)
                .collect(Collectors.toList());

        // Delete admins that are not in the configured list
        for (String existingEmail : existingAdminEmails) {
            if (!adminEmails.contains(existingEmail)) {
                userRepository.deleteById(existingEmail);
                System.out.println("🗑️ Old admin user deleted: " + existingEmail);
            }
        }

        // Create or update each admin
        for (int i = 0; i < adminEmails.size(); i++) {
            String email = adminEmails.get(i);
            String password = adminPasswords.get(i);
            String name = (adminNames.size() > i) ? adminNames.get(i) : "Admin " + (i + 1);

            if (!userRepository.existsById(email)) {
                User admin = new User();
                admin.setEmail(email);
                admin.setPassword(password);
                admin.setName(name);
                admin.setFullName(name);
                admin.setRoles(Set.of("ADMIN"));
                admin.setDesignation("Administrator");

                userRepository.save(admin);
                System.out.println("✅ Admin user created: " + email);
            } else {
                User existingAdmin = userRepository.findById(email).orElse(null);
                if (existingAdmin != null) {
                    existingAdmin.setPassword(password);
                    existingAdmin.setName(name);
                    existingAdmin.setFullName(name);
                    //  Ensure department and designation are set on update too
                    if (existingAdmin.getDepartment() == null) {
                        existingAdmin.setDepartment("Administration");
                    }
                    if (existingAdmin.getDesignation() == null) {
                        existingAdmin.setDesignation("Administrator");
                    }
                    userRepository.save(existingAdmin);
                    System.out.println("🔄 Admin user updated: " + email);
                }
            }
        }

        System.out.println("✅ Total admins configured: " + adminEmails.size());
    }
}